import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import { AyncThunkRejectType } from "./ReduxStore";
import { setChatThread, setIsLastChatMessagesListPage } from "./ChatSlice";
import { ChatServerResponseErrorBody } from "../clients/ChatClientInterface";
import ChatClient from "../clients/ChatClient";
import SliceHelper from "../helpers/SliceHelper";
import TypeFormatter from "../helpers/TypeFormatter";
import Mapper from "../helpers/Mapper";
import ChatThreadOverview from "../classes/ChatThreadOverview";
import CONSTANTS from "../../Constants";

interface HomeState {
    chatThreadList: ChatThreadOverview[];       // sorted descendingly temporaly at all times!
    isLoadingChatThreads: boolean;
    isInitialLoadFinished: boolean;
    isFilterCurrentlyChanging: boolean;
    isLoadingOlderChatThreads: boolean;
    isLastChatThreadListPage: boolean;
    isDropdownOpen: boolean;

    isActiveChatThreadPanelExpanded: boolean;
}

const initialState: HomeState = {
    chatThreadList: [],
    isLoadingChatThreads: true,
    isInitialLoadFinished: false,
    isFilterCurrentlyChanging: false,
    isLoadingOlderChatThreads: false,
    isLastChatThreadListPage: false,
    isDropdownOpen: false,

    isActiveChatThreadPanelExpanded: false
};

function sortChatThreadOverviews(chatThreadOverviews: ChatThreadOverview[]): ChatThreadOverview[] {
    // sorting ChatThreadOverviews based on the latest activity in the ChatThread (lastMessage or createdAt (if no messages were exchanged so far))
    const sortedChatThreadOverviews = chatThreadOverviews.toSorted((first, second) => {
        const firstLatestChatThreadActivityTimestamp =
            first.getLastMessageTimestamp() !== null ? first.getLastMessageTimestamp() : first.getChatThreadCreatedAtTimestamp();
        const secondLatestChatThreadActivityTimestamp =
            second.getLastMessageTimestamp() !== null ? second.getLastMessageTimestamp() : second.getChatThreadCreatedAtTimestamp();
        
        return secondLatestChatThreadActivityTimestamp - firstLatestChatThreadActivityTimestamp;
    });

    return sortedChatThreadOverviews;
}

function isChatThreadOverviewInChatThreadList(queriedChatThreadOverview: ChatThreadOverview | null, chatThreadList: ChatThreadOverview[]): boolean {
    if (queriedChatThreadOverview === null) {
        return true;
    }

    const isInList = chatThreadList.find(chatThread => chatThread.getId() === queriedChatThreadOverview.getId()) !== undefined;
    return isInList;
}

function mergeChatThreadOverviewPageIntoList(chatThreadList: ChatThreadOverview[], chatThreadListPage: ChatThreadOverview[]): ChatThreadOverview[] {
    const mergedList = [...chatThreadList];

    for (let i = 0; i < chatThreadListPage.length; i++) {
        const isAlreadyInList = isChatThreadOverviewInChatThreadList(chatThreadListPage[i], chatThreadList);
        if (isAlreadyInList === false) {
            mergedList.push(chatThreadListPage[i]);
        }
    }

    return mergedList;
}

export const getChatThreads = createAsyncThunk<ChatThreadOverview[], {
    chatThreadSearchFilter: string, currentPageNumber: string,
    currentlySelectedChatThread: ChatThreadOverview | null, isInitialRetrieval: boolean
}, AyncThunkRejectType>(
    "home/getChatThreads",
    async ({ chatThreadSearchFilter, currentPageNumber, currentlySelectedChatThread, isInitialRetrieval }, thunkAPI) => {
        try {           
            const queryParams = new URLSearchParams();
            queryParams.set(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER, chatThreadSearchFilter);
            queryParams.set(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER, currentPageNumber);
            queryParams.set(CONSTANTS.IS_INITIAL_RETRIEVAL_QUERY_PARAMETER, TypeFormatter.booleanToString(isInitialRetrieval));

            const retrievedChatThreadOverviews = await ChatClient.getChatClient().getChatThreads(queryParams);
            const { pagedList, isLastPage } = retrievedChatThreadOverviews.data;

            const chatThreadOverviews = pagedList.map(chatThreadOverviewDto => Mapper.chatThreadOverviewFromDto(chatThreadOverviewDto));

            if (isInitialRetrieval === true) {
                thunkAPI.dispatch(setChatThreadList({ newChatThreadList: chatThreadOverviews, currentlySelectedChatThread: currentlySelectedChatThread }));
            } else {
                thunkAPI.dispatch(appendChatThreadsToList({ chatThreadListPage: chatThreadOverviews, currentlySelectedChatThread: currentlySelectedChatThread }));
            }
            
            thunkAPI.dispatch(setIsLastChatThreadListPage(isLastPage));
            thunkAPI.dispatch(setIsInitialLoadFinished(true));

            return thunkAPI.fulfillWithValue(chatThreadOverviews);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const getChatThreadsWithSelectedChatThread = createAsyncThunk<ChatThreadOverview[], {
    chatThreadSearchFilter: string, currentPageNumber: string,
    currentlySelectedChatThreadId: string
}, AyncThunkRejectType>(
    "home/getChatThreadsWithSelectedChatThread",
    async ({ chatThreadSearchFilter, currentPageNumber, currentlySelectedChatThreadId }, thunkAPI) => {
        try {           
            const queryParams = new URLSearchParams();
            queryParams.set(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER, chatThreadSearchFilter);
            queryParams.set(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER, currentPageNumber);
            queryParams.set(CONSTANTS.SELECTED_CHAT_THREAD_ID_QUERY_PARAMETER, currentlySelectedChatThreadId);

            const res = await ChatClient.getChatClient().getChatThreadsWithSelectedChatThread(queryParams);            
            const { selectedChatThread, chatThreadsPage } = res.data;

            const chatThread = Mapper.chatThreadFromDto(selectedChatThread);
            const chatThreadOverviews = chatThreadsPage.pagedList.map(chatThreadOverviewDto => Mapper.chatThreadOverviewFromDto(chatThreadOverviewDto));

            thunkAPI.dispatch(setChatThread(chatThread));
            if (chatThread.getMessages().length < CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE) {
                thunkAPI.dispatch(setIsLastChatMessagesListPage(true));
            }
            
            thunkAPI.dispatch(setChatThreadList({ newChatThreadList: chatThreadOverviews, currentlySelectedChatThread: chatThread.getOverview() }));
            thunkAPI.dispatch(setIsLastChatThreadListPage(chatThreadsPage.isLastPage));
            thunkAPI.dispatch(setIsInitialLoadFinished(true));

            return thunkAPI.fulfillWithValue(chatThreadOverviews);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

// NOTE: Redux Toolkit supports Side Effects within Reducers and ExtraReducers
export const HomeSlice = createSlice({
    name: "home",
    initialState,
    reducers: {
        setChatThreadList: (state, action: { payload: { newChatThreadList: ChatThreadOverview[], currentlySelectedChatThread: ChatThreadOverview | null }}) => {
            const { newChatThreadList, currentlySelectedChatThread} = action.payload;
            if (isChatThreadOverviewInChatThreadList(currentlySelectedChatThread, newChatThreadList) === false) {
                newChatThreadList.push(currentlySelectedChatThread as ChatThreadOverview);
            }

            const sortedNewChatThreadList = sortChatThreadOverviews(newChatThreadList);
            state.chatThreadList = sortedNewChatThreadList;
        },
        appendChatThreadsToList: (state, action: { payload: { chatThreadListPage: ChatThreadOverview[], currentlySelectedChatThread: ChatThreadOverview | null } }) => {
            const { chatThreadListPage, currentlySelectedChatThread } = action.payload;
            const mergedChatThreadLists = mergeChatThreadOverviewPageIntoList(state.chatThreadList as ChatThreadOverview[], chatThreadListPage);
            if (isChatThreadOverviewInChatThreadList(currentlySelectedChatThread, mergedChatThreadLists as ChatThreadOverview[]) === false) {
                mergedChatThreadLists.push(currentlySelectedChatThread as ChatThreadOverview);
            }

            const sortedNewChatThreadList = sortChatThreadOverviews(mergedChatThreadLists as ChatThreadOverview[]);
            state.chatThreadList = sortedNewChatThreadList;
        },
        setIsLoadingChatThreads: (state, action: { payload: boolean }) => {
            state.isLoadingChatThreads = action.payload;
        },
        setIsInitialLoadFinished:(state, action: { payload: boolean }) => {
            state.isInitialLoadFinished = action.payload;
        }, 
        setIsChatThreadsFilterCurrentlyChanging: (state, action: { payload: boolean }) => {
            state.isFilterCurrentlyChanging = action.payload;
        },
        setIsLoadingOlderChatThreads: (state, action: { payload: boolean }) => {
            state.isLoadingOlderChatThreads = action.payload;
        },
        setIsLastChatThreadListPage: (state, action: { payload: boolean }) => {
            state.isLastChatThreadListPage = action.payload;
        },
        setIsDropdownOpen: (state, action: { payload: boolean }) => {
            state.isDropdownOpen = action.payload;
        },
        setIsActiveChatThreadPanelExpanded: (state, action: { payload: boolean }) => {
            state.isActiveChatThreadPanelExpanded = action.payload;
        },
        clearHomeState: (state) => {
            state.chatThreadList = initialState.chatThreadList;
            state.isLoadingChatThreads = initialState.isLoadingChatThreads;
            state.isInitialLoadFinished = initialState.isInitialLoadFinished;
            state.isFilterCurrentlyChanging = initialState.isFilterCurrentlyChanging;
            state.isLoadingOlderChatThreads = initialState.isLoadingOlderChatThreads;
            state.isLastChatThreadListPage = initialState.isLastChatThreadListPage;
            state.isDropdownOpen = initialState.isDropdownOpen;
            state.isActiveChatThreadPanelExpanded = initialState.isActiveChatThreadPanelExpanded;
        }
    }
});

export const {
    setIsLoadingChatThreads,
    setIsInitialLoadFinished,
    setChatThreadList,
    appendChatThreadsToList,
    setIsChatThreadsFilterCurrentlyChanging,
    setIsLoadingOlderChatThreads,
    setIsLastChatThreadListPage,
    setIsDropdownOpen,
    setIsActiveChatThreadPanelExpanded,
    clearHomeState
} = HomeSlice.actions;
