import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import { AyncThunkRejectType, RootState } from "./ReduxStore";
import { ChatServerResponseErrorBody } from "../clients/ChatClientInterface";
import ChatClient from "../clients/ChatClient";
import SliceHelper from "../helpers/SliceHelper";
import Mapper from "../helpers/Mapper";
import ChatThreadOverview from "../classes/ChatThreadOverview";

interface HomeState {
    chatThreadList: ChatThreadOverview[];       // sorted descendingly temporaly at all times!
    isLoadingChatThreads: boolean;
    isLoadingOlderChatThreads: boolean;
    chatThreadSearchFilter: string;
    currentChatThreadListPage: number;
    isLastChatThreadListPage: boolean;
    isDropdownOpen: boolean;
}

const initialState: HomeState = {
    chatThreadList: [],
    isLoadingChatThreads: true,
    isLoadingOlderChatThreads: false,
    chatThreadSearchFilter: "",
    currentChatThreadListPage: 0,
    isLastChatThreadListPage: false,
    isDropdownOpen: false
};

export const getChatThreads = createAsyncThunk<ChatThreadOverview[], void, AyncThunkRejectType>(
    "home/getChatThreads",
    async (_, thunkAPI) => {
        try {
            const { chatThreadSearchFilter, currentChatThreadListPage } = (thunkAPI.getState() as RootState).homeSlice;
            
            const queryParams = new URLSearchParams();
            queryParams.set("pageNumber", currentChatThreadListPage.toString());
            queryParams.set("chatThreadSearchFilter", chatThreadSearchFilter);

            const retrievedChatThreadOverviews = await ChatClient.getChatClient().getChatThreads(queryParams);
            const { pagedList, isLastPage } = retrievedChatThreadOverviews.data;

            const chatThreadOverviews = pagedList.map(chatThreadOverviewDto => Mapper.chatThreadOverviewFromDto(chatThreadOverviewDto));
            thunkAPI.dispatch(appendChatThreadsToList(chatThreadOverviews));
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
        appendChatThreadsToList: (state, action: { payload: ChatThreadOverview[] }) => {
            const mergedChatThreadLists = [...action.payload, ...state.chatThreadList];

            // sorting ChatThreadList based on the latest activity in the ChatThread (lastMessage or createdAt (if no messages were exchanged so far))
            const sortedNewChatThreadList = mergedChatThreadLists.toSorted((first, second) => {
                const firstLatestChatThreadActivityTimestamp =
                    first.getLastMessageTimestamp() !== null ? first.getLastMessageTimestamp() : first.getChatThreadCreatedAtTimestamp();
                const secondLatestChatThreadActivityTimestamp =
                    second.getLastMessageTimestamp() !== null ? second.getLastMessageTimestamp() : second.getChatThreadCreatedAtTimestamp();
                
                return secondLatestChatThreadActivityTimestamp - firstLatestChatThreadActivityTimestamp;
            });

            state.chatThreadList = sortedNewChatThreadList;
        },
        setIsLoadingChatThreads: (state, action: { payload: boolean }) => {
            state.isLoadingChatThreads = action.payload;
        },
        setIsLoadingOlderChatThreads: (state, action: { payload: boolean }) => {
            state.isLoadingOlderChatThreads = action.payload;
        },
        setChatThreadSearchFilter: (state, action: { payload: string }) => {
            state.chatThreadSearchFilter = action.payload;
        },
        setCurrentChatThreadListPage: (state, action: { payload: number }) => {
            state.currentChatThreadListPage = action.payload;
        },
        setIsLastChatThreadListPage: (state, action: { payload: boolean }) => {
            state.isLastChatThreadListPage = action.payload;
        },
        setIsDropdownOpen: (state, action: { payload: boolean }) => {
            state.isDropdownOpen = action.payload;
        },
        clearHomeState: (state) => {
            state.chatThreadList = initialState.chatThreadList;
            state.isLoadingChatThreads = initialState.isLoadingChatThreads;
            state.isLoadingOlderChatThreads = initialState.isLoadingOlderChatThreads;
            state.chatThreadSearchFilter = initialState.chatThreadSearchFilter;
            state.currentChatThreadListPage = initialState.currentChatThreadListPage;
            state.isLastChatThreadListPage = initialState.isLastChatThreadListPage;
            state.isDropdownOpen = initialState.isDropdownOpen;
        }
    }
});

export const {
    setIsLoadingChatThreads,
    appendChatThreadsToList,
    setIsLoadingOlderChatThreads,
    setChatThreadSearchFilter,
    setCurrentChatThreadListPage,
    setIsLastChatThreadListPage,
    setIsDropdownOpen,
    clearHomeState
} = HomeSlice.actions;
