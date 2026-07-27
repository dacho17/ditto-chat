import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import { AyncThunkRejectType, RootState } from "./ReduxStore";
import { ChatServerResponseErrorBody } from "../clients/ChatClientInterface";
import ChatClient from "../clients/ChatClient";
import SliceHelper from "../helpers/SliceHelper";
import Mapper from "../helpers/Mapper";
import ChatterOverview from "../classes/ChatterOverview";

interface ChattersState {
    chatterOverviewList: ChatterOverview[];     // sorted descendingly alphabetically at all times!
    isLoadingChatterOverviews: boolean;
    isLoadingOlderChatterOverviews: boolean;
    chatterSearchFilter: string;
    currentChatterOverviewListPage: number;
    isLastChatterOverviewListPage: boolean;
}

const initialState: ChattersState = {
    chatterOverviewList: [],
    isLoadingChatterOverviews: true,
    isLoadingOlderChatterOverviews: false,
    chatterSearchFilter: "",
    currentChatterOverviewListPage: 0,
    isLastChatterOverviewListPage: false,
};

export const getChatters = createAsyncThunk<ChatterOverview[], void, AyncThunkRejectType>(
    "chatters/getChatters",
    async (_, thunkAPI) => {
        try {
            const { currentChatterOverviewListPage, chatterSearchFilter } = (thunkAPI.getState() as RootState).chattersSlice;

            const queryParams = new URLSearchParams();
            queryParams.set("pageNumber", currentChatterOverviewListPage.toString());
            queryParams.set("chatterSearchFilter", chatterSearchFilter);
            
            const retrievedChatterOverviews = await ChatClient.getChatClient().getChatters(queryParams);
            const { pagedList, isLastPage } = retrievedChatterOverviews.data;

            const chatterOverviews = pagedList.map(chatterOverviewDto => Mapper.chatterOverviewFromDto(chatterOverviewDto));
            thunkAPI.dispatch(appendChatterOverviewsToList(chatterOverviews));
            thunkAPI.dispatch(setIsLastChatterOverviewListPage(isLastPage));

            return thunkAPI.fulfillWithValue(chatterOverviews);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const ChattersSlice = createSlice({
    name: "chatters",
    initialState,
    reducers: {
        appendChatterOverviewsToList: (state, action: { payload: ChatterOverview[] }) => {
            state.chatterOverviewList = [...state.chatterOverviewList, ...action.payload];  // TODO: may need to be sorted!
        },
        setIsLoadingChatterOverviews: (state, action: { payload: boolean }) => {
            state.isLoadingChatterOverviews = action.payload;
        },
        setIsLoadingOlderChatterOverviews: (state, action: { payload: boolean }) => {
            state.isLoadingOlderChatterOverviews = action.payload;
        },
        setChatterSearchFilter: (state, action: { payload: string }) => {
            state.chatterSearchFilter = action.payload;
        },
        setCurrentChatterOverviewListPage: (state, action: { payload: number }) => {
            state.currentChatterOverviewListPage = action.payload;
        },
        setIsLastChatterOverviewListPage: (state, action: { payload: boolean }) => {
            state.isLastChatterOverviewListPage = action.payload;
        },
        clearChattersState: (state) => {
            state.chatterOverviewList = initialState.chatterOverviewList;
            state.isLoadingChatterOverviews = initialState.isLoadingChatterOverviews;
            state.isLoadingOlderChatterOverviews = initialState.isLoadingOlderChatterOverviews;
            state.chatterSearchFilter = initialState.chatterSearchFilter;
            state.currentChatterOverviewListPage = initialState.currentChatterOverviewListPage;
            state.isLastChatterOverviewListPage = initialState.isLastChatterOverviewListPage;
        }
    }
});

export const {
    appendChatterOverviewsToList,
    setIsLoadingChatterOverviews,
    setIsLoadingOlderChatterOverviews,
    setChatterSearchFilter,
    setCurrentChatterOverviewListPage,
    setIsLastChatterOverviewListPage,
    clearChattersState
} = ChattersSlice.actions;
