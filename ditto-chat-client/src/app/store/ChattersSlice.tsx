import { createAsyncThunk, createSlice, GetThunkAPI } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import { AsyncThunkRejectType, RootState } from "./ReduxStore";
import { ChatServerResponseErrorBody } from "../clients/ChatClientInterface";
import ChatClient from "../clients/ChatClient";
import SliceHelper from "../helpers/SliceHelper";
import Mapper from "../helpers/Mapper";
import ChatterOverview from "../classes/ChatterOverview";
import TypeFormatter from "../helpers/TypeFormatter";
import CONSTANTS from "../../Constants";
import TimeHelper from "../helpers/TimeHelper";

type ChatterOverviewsCacheValue = { cachedChatterOverviewList: ChatterOverview[], lastRetrievedPageNumber: number, isLastPage: boolean };
interface ChattersState {
    chatterOverviewList: ChatterOverview[];     // sorted descendingly alphabetically at all times!
    isLoadingChatterOverviews: boolean;
    isFilterCurrentlyChanging: boolean;
    isLoadingOlderChatterOverviews: boolean;
    isLastChatterOverviewListPage: boolean;
    isCreatingNewChatThread: boolean;

    retrievedChatterOverviewsCache: { searchFilter: string, cachedValue: ChatterOverviewsCacheValue, expiresAtTimestamp: number }[];
}

const initialState: ChattersState = {
    chatterOverviewList: [],
    isLoadingChatterOverviews: true,
    isFilterCurrentlyChanging: false,
    isLoadingOlderChatterOverviews: false,
    isLastChatterOverviewListPage: false,
    isCreatingNewChatThread: false,

    retrievedChatterOverviewsCache: []
};

function sortChatterOverviews(chatterOverviews: ChatterOverview[]): ChatterOverview[] {
    const sortedChatterOverviews = chatterOverviews.toSorted((first, second) => {
        const firstChatterFullName = first.getChatterFullName();
        const secondChatterFullName = second.getChatterFullName();
        
        return firstChatterFullName.toLowerCase().localeCompare(secondChatterFullName.toLowerCase());
    });

    return sortedChatterOverviews;
}

function mergeChatterOverviewPageIntoList(chatterOverviewsList: ChatterOverview[], chatterOverviewPage: ChatterOverview[]): ChatterOverview[] {
    const mergedList = [...chatterOverviewsList];

    for (let i = 0; i < chatterOverviewPage.length; i++) {
        const isAlreadyInList =
            mergedList.find(chatterOverview => chatterOverview.getId() === chatterOverviewPage[i].getId()) !== undefined
        if (isAlreadyInList === false) {
            mergedList.push(chatterOverviewPage[i]);
        }
    }

    return mergedList;
}

function retrieveChatterOverviewsFromCache(chatterSearchFilter: string, targetPageNumber: number, isInitialRetrieval: boolean, thunkAPI: GetThunkAPI<any>): {
    previouslyCachedChatterOverviews: ChatterOverview[], previouslyCachedIsLastPage: boolean } | null
{
    const { retrievedChatterOverviewsCache } = (thunkAPI.getState() as RootState).chattersSlice;
    
    const cachedChatterOverviewsEntry = retrievedChatterOverviewsCache.find(cachedEntry => cachedEntry.searchFilter === chatterSearchFilter);
    if (cachedChatterOverviewsEntry !== undefined) {
        if (cachedChatterOverviewsEntry.expiresAtTimestamp < TimeHelper.getCurrentTimestamp()) {
            // Entry exists but has expired. It needs to be deleted from the Cache
            thunkAPI.dispatch(removeChatterOverviewsFromCache({ searchFilter: cachedChatterOverviewsEntry.searchFilter }));
            return null;
        }

        if (targetPageNumber <= cachedChatterOverviewsEntry.cachedValue.lastRetrievedPageNumber) {
            // Target Page has been Cached
            const targetCachedChatterOverviewList = isInitialRetrieval === true
                ? cachedChatterOverviewsEntry.cachedValue.cachedChatterOverviewList.slice(0, (targetPageNumber + 1) * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE)
                : cachedChatterOverviewsEntry.cachedValue.cachedChatterOverviewList.slice(targetPageNumber * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE, (targetPageNumber + 1) * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE);
            const isLastPageResult = cachedChatterOverviewsEntry.cachedValue.isLastPage;

            console.log(`Returning ChatterOverviews from Cache: ${targetCachedChatterOverviewList.length}`);
            return {
                previouslyCachedChatterOverviews: targetCachedChatterOverviewList,
                previouslyCachedIsLastPage: isLastPageResult
            };
        }
    }

    return null;    // Entry does not exist, or if it does the Target Page has not been Cached yet
}

export const getChatters = createAsyncThunk<ChatterOverview[], { chatterSearchFilter: string, currentPageNumber: string, isInitialRetrieval: boolean }, { rejectValue: AsyncThunkRejectType }>(
    "chatters/getChatters",
    async ({ chatterSearchFilter, currentPageNumber, isInitialRetrieval }, thunkAPI) => {
        try {
            const queryParams = new URLSearchParams();
            queryParams.set(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER, chatterSearchFilter);
            queryParams.set(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER, currentPageNumber);
            queryParams.set(CONSTANTS.IS_INITIAL_RETRIEVAL_QUERY_PARAMETER, TypeFormatter.booleanToString(isInitialRetrieval));

            // checks if there is an entry already in Cache, and if yes, use the Cached object and do not send the request to the server!
            const cacheResponse =
                retrieveChatterOverviewsFromCache(chatterSearchFilter, TypeFormatter.stringToInt(currentPageNumber), isInitialRetrieval, thunkAPI);
            
            const { pagedList, isLastPage } = cacheResponse !== null
                ? { pagedList: cacheResponse.previouslyCachedChatterOverviews, isLastPage: cacheResponse.previouslyCachedIsLastPage }
                : (await ChatClient.getChatClient().getChatters(queryParams)).data;
            const chatterOverviews = pagedList.map(chatterOverviewDto => Mapper.chatterOverviewFromDto(chatterOverviewDto));

            if (isInitialRetrieval === true) {
                thunkAPI.dispatch(setChatterOverviewsList(chatterOverviews));
            } else {
                thunkAPI.dispatch(appendChatterOverviewsToList(chatterOverviews));
            }

            thunkAPI.dispatch(setIsLastChatterOverviewListPage(isLastPage));

            // store the Retrieved Result in the Cache
            const { chatterOverviewList } = (thunkAPI.getState() as RootState).chattersSlice;    // I expect this assignment to contain chatThreadOverviews updated by the previous Dispatch Calls!
            thunkAPI.dispatch(addChatterOverviewsToCache({
                chatterOverviewListToCache: chatterOverviewList,
                searchFilter: chatterSearchFilter, pageNumber: TypeFormatter.stringToInt(currentPageNumber), isLastPage: isLastPage
            }));

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
            const mergedChatterOverviewLists = mergeChatterOverviewPageIntoList(state.chatterOverviewList as ChatterOverview[], action.payload);
            const sortedNewChatterOverviewsList = sortChatterOverviews(mergedChatterOverviewLists as ChatterOverview[]);

            state.chatterOverviewList = sortedNewChatterOverviewsList;            
        },
        addChatterOverviewsToCache: (state, action: { payload: {
            chatterOverviewListToCache: ChatterOverview[], searchFilter: string, pageNumber: number, isLastPage: boolean }
        }) => {
            const updatedCache = [...state.retrievedChatterOverviewsCache];
            const valueToCache = {
                cachedChatterOverviewList: action.payload.chatterOverviewListToCache,
                lastRetrievedPageNumber: action.payload.pageNumber,
                isLastPage: action.payload.isLastPage
            } as ChatterOverviewsCacheValue;

            // Updates the existing cacheEntry, or creates a new one if one does not exist
            const targetCacheEntryIndex = updatedCache.findIndex(cachedEntry => cachedEntry.searchFilter === action.payload.searchFilter);
            if (targetCacheEntryIndex !== -1) {
                updatedCache[targetCacheEntryIndex].cachedValue = valueToCache;
            } else {
                const cachedEntryExpiresAtTimestamp = TimeHelper.getCurrentTimestamp() + CONSTANTS.SHORTLY_CACHED_ENTRY_EXPIRES_IN_MS;
                updatedCache.push({ searchFilter: action.payload.searchFilter, cachedValue: valueToCache, expiresAtTimestamp: cachedEntryExpiresAtTimestamp });
            }

            state.retrievedChatterOverviewsCache = updatedCache;
        },
        removeChatterOverviewsFromCache: (state, action: { payload: { searchFilter: string }}) => {
            const updatedCache = [...state.retrievedChatterOverviewsCache]
                .filter(chatterOverviewCacheEntry => chatterOverviewCacheEntry.searchFilter !== action.payload.searchFilter);
            
            state.retrievedChatterOverviewsCache = updatedCache;
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
        setIsCreatingNewChatThread: (state, action: { payload: boolean }) => {
            state.isCreatingNewChatThread = action.payload;
        },
        clearChattersState: (state) => {
            state.chatterOverviewList = initialState.chatterOverviewList;
            state.isLoadingChatterOverviews = initialState.isLoadingChatterOverviews;
            state.isFilterCurrentlyChanging = initialState.isFilterCurrentlyChanging;
            state.isLoadingOlderChatterOverviews = initialState.isLoadingOlderChatterOverviews;
            state.isLastChatterOverviewListPage = initialState.isLastChatterOverviewListPage;
            state.isCreatingNewChatThread = initialState.isCreatingNewChatThread;
            state.retrievedChatterOverviewsCache = initialState.retrievedChatterOverviewsCache;
        }
    }
});

export const {
    setChatterOverviewsList,
    appendChatterOverviewsToList,
    addChatterOverviewsToCache,
    removeChatterOverviewsFromCache,
    setIsLoadingChatterOverviews,
    setIsChattersFilterCurrentlyChanging,
    setIsLoadingOlderChatterOverviews,
    setIsLastChatterOverviewListPage,
    setIsCreatingNewChatThread,
    clearChattersState
} = ChattersSlice.actions;
