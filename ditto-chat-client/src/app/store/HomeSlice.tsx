import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import { AsyncThunkRejectType, RootState } from "./ReduxStore";
import { registerPolledActiveChatThread, setChatThread } from "./ChatSlice";
import { ChatServerResponseBody, ChatServerResponseErrorBody } from "../clients/ChatClientInterface";
import ChatClient from "../clients/ChatClient";
import SliceHelper from "../helpers/SliceHelper";
import TypeFormatter from "../helpers/TypeFormatter";
import Mapper from "../helpers/Mapper";
import ChatThreadOverview from "../classes/ChatThreadOverview";
import PagedListDto from "../interfaces/PagedListDto";
import ChatThreadOverviewDto from "../interfaces/ChatThreadOverviewDto";
import ChatThreadDto from "../interfaces/ChatThreadDto";
import CONSTANTS from "../../Constants";

interface HomeState {
    chatThreadList: ChatThreadOverview[];       // sorted descendingly temporaly at all times!
    isLoadingChatThreads: boolean;
    isInitialLoadFinished: boolean;
    isFilterCurrentlyChanging: boolean;
    isLoadingOlderChatThreads: boolean;
    isLastChatThreadListPage: boolean;

    isActiveChatThreadPanelExpanded: boolean;
}

const initialState: HomeState = {
    chatThreadList: [],
    isLoadingChatThreads: true,
    isInitialLoadFinished: false,
    isFilterCurrentlyChanging: false,
    isLoadingOlderChatThreads: false,
    isLastChatThreadListPage: true,

    isActiveChatThreadPanelExpanded: false
};

function sortChatThreadOverviews(chatThreadOverviews: ChatThreadOverview[]): ChatThreadOverview[] {
    // sorting ChatThreadOverviews based on the latest activity in the ChatThread (lastMessage or createdAt (if no messages were exchanged so far))
    const sortedChatThreadOverviews = chatThreadOverviews.toSorted((first, second) => {
        return second.getLatestChatThreadActivityTimestamp() - first.getLatestChatThreadActivityTimestamp();
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

function mergeAndUpdateChatThreadOverviews(currentChatThreadList: ChatThreadOverview[], updatedChatThreadList: ChatThreadOverview[]): ChatThreadOverview[] {
    const mergedList = [...updatedChatThreadList];

    for (let i = 0; i < currentChatThreadList.length; i++) {
        const isAlreadyInUpdatedList = isChatThreadOverviewInChatThreadList(currentChatThreadList[i], mergedList);
        if (isAlreadyInUpdatedList === false) {
            mergedList.push(currentChatThreadList[i]);
        }
    }

    return mergedList;
}

function generateQueryParams(chatThreadSearchFilter: string, currentPageNumber: string, isInitialRetrieval: boolean, isPolling: boolean): URLSearchParams {
    const queryParams = new URLSearchParams();
    queryParams.set(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER, chatThreadSearchFilter);
    queryParams.set(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER, currentPageNumber);
    queryParams.set(CONSTANTS.IS_INITIAL_RETRIEVAL_QUERY_PARAMETER, TypeFormatter.booleanToString(isInitialRetrieval));
    queryParams.set(CONSTANTS.IS_POLLING_QUERY_PARAMTER, TypeFormatter.booleanToString(isPolling));

    return queryParams;
}

// This Function differentiates Calls:
    // a) on Mobile and Non-Mobile Devices
    // b) initial Retrievals and non-Initial Retrievals (older ChatThreads and Polling)
    // c) Retrieving chatThreads when there is a ChatThread Selected (Chat openned on Non-Mobile Devices)
export const getChatThreadsOnHomePage = createAsyncThunk<ChatThreadOverview[], {
    chatThreadSearchFilter: string, currentPageNumber: string,
    currentlySelectedChatThreadId: string | null, isInitialRetrieval: boolean, isPolling: boolean
}, { rejectValue: AsyncThunkRejectType }>(
    "home/getChatThreadsOnHomePage",
    async ({ chatThreadSearchFilter, currentPageNumber, currentlySelectedChatThreadId, isInitialRetrieval, isPolling }, thunkAPI) => {
        const { chatterOverview } = (thunkAPI.getState() as RootState).authSlice;

        try {
            const queryParams = generateQueryParams(
                chatThreadSearchFilter, currentPageNumber,
                isInitialRetrieval, isPolling
            );

            let [chatThreadsResponse, selectedChatThreadResponse]:
                [ChatServerResponseBody<PagedListDto<ChatThreadOverviewDto>> | null, ChatServerResponseBody<ChatThreadDto> | null] = [null, null];
            if (currentlySelectedChatThreadId !== null) {
                [chatThreadsResponse, selectedChatThreadResponse] = await Promise.all([
                    ChatClient.getChatClient().getChatThreads(queryParams),
                    ChatClient.getChatClient().getChatThread(currentlySelectedChatThreadId)
                ]);
            } else {
                chatThreadsResponse = await ChatClient.getChatClient().getChatThreads(queryParams);
            }

            SliceHelper.handleResponseBody(chatThreadsResponse, thunkAPI);
            const selectedChatThreadFromServer = selectedChatThreadResponse !== null
                ? Mapper.chatThreadFromDto(selectedChatThreadResponse.data, chatterOverview.getId())
                : null;
            const { pagedList, isLastPage } = chatThreadsResponse.data;
            const chatThreadOverviews = pagedList.map(chatThreadOverviewDto => Mapper.chatThreadOverviewFromDto(chatThreadOverviewDto));

            if (selectedChatThreadFromServer !== null) {
                const isLastSelectedChatThreadMessagesPage = selectedChatThreadResponse.data.chatThreadMessages.isLastPage;
                if (isInitialRetrieval === true) {
                    thunkAPI.dispatch(setChatThread({ chatThread: selectedChatThreadFromServer, isLastChatThreadMessagesPage: isLastSelectedChatThreadMessagesPage }));
                } else if (isPolling === true) {
                    thunkAPI.dispatch(registerPolledActiveChatThread({ chatThread: selectedChatThreadFromServer, isLastChatThreadMessagesPage: isLastSelectedChatThreadMessagesPage}));
                } else {
                    // not an initial Retrieval nor Polling. Case of retrieving older ChatThreads on Non-Mobile Page (tryGetOlderChatThreads Call)
                    // do nothing on selectedChatThread
                }
            }

            const { chatThread } = (thunkAPI.getState() as RootState).chatSlice;    // chatThread contains updates after Function Calls above
            const selectedChatThreadOverview = chatThread !== null
                ? chatThread.getOverview() : null;
            if (isInitialRetrieval === true) {
                thunkAPI.dispatch(setChatThreadList({ newChatThreadList: chatThreadOverviews, currentlySelectedChatThread: selectedChatThreadOverview }));
                thunkAPI.dispatch(setIsInitialLoadFinished(true));
            } else {
                thunkAPI.dispatch(appendChatThreadsToList({ chatThreadListPage: chatThreadOverviews, currentlySelectedChatThread: selectedChatThreadOverview }));
            }
            
            thunkAPI.dispatch(setIsLastChatThreadListPage(isLastPage));

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
            const mergedChatThreadLists = mergeAndUpdateChatThreadOverviews(state.chatThreadList as ChatThreadOverview[], chatThreadListPage);

            // add or update currently selected ChatThread in ChatThread List, if a ChatThread is selected
            if (currentlySelectedChatThread !== null) {
                if (isChatThreadOverviewInChatThreadList(currentlySelectedChatThread, mergedChatThreadLists as ChatThreadOverview[]) === false) {
                    mergedChatThreadLists.push(currentlySelectedChatThread as ChatThreadOverview);
                } else {
                    // if the activeChatThread is in the list, store up-to-date data from selectedChatThread to the chatThreadList
                    // this logic depends on prior execution of registerPolledActiveChatThread Function
                    mergedChatThreadLists.map(chatThreadOverview => {
                        if (chatThreadOverview.getId() === currentlySelectedChatThread.getId()) {
                            return currentlySelectedChatThread; // this is more up-to-date data!
                        }

                        return chatThreadOverview;
                    });
                }
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
        setIsActiveChatThreadPanelExpanded: (state, action: { payload: boolean }) => {
            state.isActiveChatThreadPanelExpanded = action.payload;
        },
        updateChatThreadOverviewFromList: (state, action: { payload: ChatThreadOverview }) => {
            const updatedChatThreadOverview = action.payload;
            
            if (isChatThreadOverviewInChatThreadList(updatedChatThreadOverview, state.chatThreadList as ChatThreadOverview[]) === false) {
                return;
            }

            const updatedChatThreadOverviews = state.chatThreadList.map(chatThreadOverview => {
                return chatThreadOverview.getId() === updatedChatThreadOverview.getId()
                    ? updatedChatThreadOverview
                    : chatThreadOverview
                ;
            });

            state.chatThreadList = sortChatThreadOverviews(updatedChatThreadOverviews as ChatThreadOverview[]);
        },
        clearHomeState: (state) => {
            state.chatThreadList = initialState.chatThreadList;
            state.isLoadingChatThreads = initialState.isLoadingChatThreads;
            state.isInitialLoadFinished = initialState.isInitialLoadFinished;
            state.isFilterCurrentlyChanging = initialState.isFilterCurrentlyChanging;
            state.isLoadingOlderChatThreads = initialState.isLoadingOlderChatThreads;
            state.isLastChatThreadListPage = initialState.isLastChatThreadListPage;
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
    setIsActiveChatThreadPanelExpanded,
    updateChatThreadOverviewFromList,
    clearHomeState
} = HomeSlice.actions;
