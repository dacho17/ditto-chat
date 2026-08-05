import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import { AyncThunkRejectType } from "./ReduxStore";
import { ChatServerResponseErrorBody } from "../clients/ChatClientInterface";
import ChatClient from "../clients/ChatClient";
import SliceHelper from "../helpers/SliceHelper";
import Mapper from "../helpers/Mapper";
import ChatterOverview from "../classes/ChatterOverview";
import TypeFormatter from "../helpers/TypeFormatter";
import CONSTANTS from "../../Constants";

interface ChattersState {
    chatterOverviewList: ChatterOverview[];     // sorted descendingly alphabetically at all times!
    isLoadingChatterOverviews: boolean;
    isFilterCurrentlyChanging: boolean;
    isLoadingOlderChatterOverviews: boolean;
    isLastChatterOverviewListPage: boolean;
}

const initialState: ChattersState = {
    chatterOverviewList: [],
    isLoadingChatterOverviews: true,
    isFilterCurrentlyChanging: false,
    isLoadingOlderChatterOverviews: false,
    isLastChatterOverviewListPage: false,
};

function sortChatterOverviews(chatterOverviews: ChatterOverview[]): ChatterOverview[] {
    const sortedChatterOverviews = chatterOverviews.toSorted((first, second) => {
        const firstChatterFullName = first.getChatterFullName();
        const secondChatterFullName = second.getChatterFullName();
        
        return firstChatterFullName.toLowerCase().localeCompare(secondChatterFullName.toLowerCase());
    });

    return sortedChatterOverviews;
}

export const getChatters = createAsyncThunk<ChatterOverview[], { chatterSearchFilter: string, currentPageNumber: string, isInitialRetrieval: boolean }, AyncThunkRejectType>(
    "chatters/getChatters",
    async ({ chatterSearchFilter, currentPageNumber, isInitialRetrieval }, thunkAPI) => {
        try {
            const queryParams = new URLSearchParams();
            queryParams.set(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER, chatterSearchFilter);
            queryParams.set(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER, currentPageNumber);
            queryParams.set(CONSTANTS.IS_INITIAL_RETRIEVAL_QUERY_PARAMETER, TypeFormatter.booleanToString(isInitialRetrieval));

            const retrievedChatterOverviews = await ChatClient.getChatClient().getChatters(queryParams);
            const { pagedList, isLastPage } = retrievedChatterOverviews.data;

            const chatterOverviews = pagedList.map(chatterOverviewDto => Mapper.chatterOverviewFromDto(chatterOverviewDto));

            if (isInitialRetrieval === true) {
                thunkAPI.dispatch(setChatterOverviewsList(chatterOverviews));
            } else {
                thunkAPI.dispatch(appendChatterOverviewsToList(chatterOverviews));
            }

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
        setChatterOverviewsList: (state, action: { payload: ChatterOverview[] }) => {
            const sortedNewChatterOverviewsList = sortChatterOverviews(action.payload);

            state.chatterOverviewList = sortedNewChatterOverviewsList;
        },
        appendChatterOverviewsToList: (state, action: { payload: ChatterOverview[] }) => {
            const mergedChatterOverviewLists = [...action.payload, ...state.chatterOverviewList];
            const sortedNewChatterOverviewsList = sortChatterOverviews(mergedChatterOverviewLists as ChatterOverview[]);

            state.chatterOverviewList = sortedNewChatterOverviewsList;            
        },
        setIsLoadingChatterOverviews: (state, action: { payload: boolean }) => {
            state.isLoadingChatterOverviews = action.payload;
        },
        setIsChattersFilterCurrentlyChanging: (state, action: { payload: boolean }) => {
            state.isFilterCurrentlyChanging = action.payload;
        },
        setIsLoadingOlderChatterOverviews: (state, action: { payload: boolean }) => {
            state.isLoadingOlderChatterOverviews = action.payload;
        },
        setIsLastChatterOverviewListPage: (state, action: { payload: boolean }) => {
            state.isLastChatterOverviewListPage = action.payload;
        },
        clearChattersState: (state) => {
            state.chatterOverviewList = initialState.chatterOverviewList;
            state.isLoadingChatterOverviews = initialState.isLoadingChatterOverviews;
            state.isFilterCurrentlyChanging = initialState.isFilterCurrentlyChanging;
            state.isLoadingOlderChatterOverviews = initialState.isLoadingOlderChatterOverviews;
            state.isLastChatterOverviewListPage = initialState.isLastChatterOverviewListPage;
        }
    }
});

export const {
    setChatterOverviewsList,
    appendChatterOverviewsToList,
    setIsLoadingChatterOverviews,
    setIsChattersFilterCurrentlyChanging,
    setIsLoadingOlderChatterOverviews,
    setIsLastChatterOverviewListPage,
    clearChattersState
} = ChattersSlice.actions;
