import { createAsyncThunk, createSlice, GetThunkAPI } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import { AsyncThunkRejectType, RootState } from "./ReduxStore";
import { ChatServerResponseErrorBody } from "../clients/ChatClientInterface";
import ChatClient from "../clients/ChatClient";
import SliceHelper from "../helpers/SliceHelper";
import TimeHelper from "../helpers/TimeHelper";
import Mapper from "../helpers/Mapper";
import Chatter from "../classes/Chatter";
import SharedFile from "../classes/SharedFile";
import CONSTANTS from "../../Constants";

type SharedFilesWithChatterCache = { cachedSharedFileList: SharedFile[], lastRetrievedPageNumber: number, isLastPage: boolean, expiresAtTimestamp: number };
interface ChatterState {
    chatter: Chatter | null;   // contains List of SharedFiles sorted descendingly temporaly at all times!
    isLoadingChatter: boolean;
    currentSharedFilesListPage: number;
    isLastSharedFilesListPage: boolean;
    isLoadingOlderSharedFiles: boolean;

    chatterSharedFileInOverlay: SharedFile | null;
    retrievedSharedFilesCache: SharedFilesWithChatterCache | null;
}

const initialState: ChatterState = {
    chatter: null,
    isLoadingChatter: true,
    currentSharedFilesListPage: 0,
    isLastSharedFilesListPage: true,
    isLoadingOlderSharedFiles: false,

    chatterSharedFileInOverlay: null,
    retrievedSharedFilesCache: null
};

function mergeSharedFilePageToList(sharedFileList: SharedFile[], sharedFilesPage: SharedFile[]): SharedFile[] {
    const mergedList = [...sharedFileList];

    for (let i = 0; i < sharedFilesPage.length; i++) {
        const isAlreadyInList =
            mergedList.find(sharedFile => sharedFile.getFileUrl() === sharedFilesPage[i].getFileUrl()) !== undefined
        if (isAlreadyInList === false) {
            mergedList.push(sharedFilesPage[i]);
        }
    }

    return mergedList;
}

function retrieveSharedFilesFromCache(targetPageNumber: number, thunkAPI: GetThunkAPI<any>): {
    previouslyCachedSharedFiles: SharedFile[], previouslyCachedIsLastPage: boolean } | null
{
    const { retrievedSharedFilesCache } = (thunkAPI.getState() as RootState).chatterSlice;
    
    if (retrievedSharedFilesCache !== null) {
        if (retrievedSharedFilesCache.expiresAtTimestamp < TimeHelper.getCurrentTimestamp()) {
            // Entry exists but has expired. It needs to be deleted from the Cache
            thunkAPI.dispatch(clearSharedFilesCache());
            return null;
        }

        if (targetPageNumber <= retrievedSharedFilesCache.lastRetrievedPageNumber) {
            // Target Page has been Cached
            const targetCachedSharedFileList = retrievedSharedFilesCache.cachedSharedFileList.slice(0, (targetPageNumber + 1) * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE);
            const isLastPageResult = retrievedSharedFilesCache.isLastPage;

            console.log(`Returning SharedFiles from Cache: ${targetCachedSharedFileList.length}`);
            return {
                previouslyCachedSharedFiles: targetCachedSharedFileList,
                previouslyCachedIsLastPage: isLastPageResult
            };
        }
    }

    return null;    // Entry does not exist, or if it does the Target Page has not been Cached yet
}

export const getChatter = createAsyncThunk<Chatter, { chatterId: string }, { rejectValue: AsyncThunkRejectType }>(
    "chatter/getChatter",
    async ({ chatterId }, thunkAPI) => {
        try {
            const responseBody = await ChatClient.getChatClient().getChatter(chatterId);
            const retrievedChatter = Mapper.chatterFromDto(responseBody.data);
            const isSharedFileLastPage = responseBody.data.sharedFiles.isLastPage;
            SliceHelper.handleResponseBody(responseBody, thunkAPI);

            thunkAPI.dispatch(setChatter(retrievedChatter));
            thunkAPI.dispatch(setIsLastSharedFilesListPage(isSharedFileLastPage));

            // store the Retrieved SharedFiles in the Cache
            const { chatter } = (thunkAPI.getState() as RootState).chatterSlice;
            thunkAPI.dispatch(updateSharedFilesCache({ sharedFilesListToCache: chatter.getSharedFiles(), pageNumber: 0, isLastPage: isSharedFileLastPage }));

            return thunkAPI.fulfillWithValue(retrievedChatter);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const getSharedFiles = createAsyncThunk<SharedFile[], { chatterId: string }, { rejectValue: AsyncThunkRejectType }>(
    "chatter/getSharedFiles",
    async ({ chatterId }, thunkAPI) => {
        try {
            const { currentSharedFilesListPage } = (thunkAPI.getState() as RootState).chatterSlice;

            const queryParams = new URLSearchParams();
            queryParams.set(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER, currentSharedFilesListPage.toString());
            
            // checks if there is an entry already in Cache, and if yes, use the Cached object and do not send the request to the server!
            let { pagedList, isLastPage } = { pagedList: null, isLastPage: null };
            const cacheResponse = retrieveSharedFilesFromCache(currentSharedFilesListPage, thunkAPI);            
            if (cacheResponse === null) {
                const responseBody = await ChatClient.getChatClient().getSharedFiles(chatterId, queryParams);
                SliceHelper.handleResponseBody(responseBody, thunkAPI);

                pagedList = responseBody.data.pagedList;
                isLastPage = responseBody.data.isLastPage;
            } else {
                pagedList = cacheResponse.previouslyCachedSharedFiles;
                isLastPage = cacheResponse.previouslyCachedIsLastPage;
            }

            const sharedFiles = pagedList.map(sharedFileDto => Mapper.sharedFileFromDto(sharedFileDto));
            thunkAPI.dispatch(appendSharedFilesToList(sharedFiles));
            thunkAPI.dispatch(setIsLastSharedFilesListPage(isLastPage));

            // store the Retrieved SharedFiles in the Cache
            const { chatter } = (thunkAPI.getState() as RootState).chatterSlice;
            thunkAPI.dispatch(updateSharedFilesCache({ sharedFilesListToCache: chatter.getSharedFiles(), pageNumber: currentSharedFilesListPage, isLastPage: isLastPage }));

            return thunkAPI.fulfillWithValue(sharedFiles);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const ChatterSlice = createSlice({
    name: "chatter",
    initialState,
    reducers: {
        setChatter: (state, action: { payload: Chatter }) => {
            state.chatter = action.payload;
        },
        setIsLoadingChatter: (state, action: { payload: boolean }) => {
            state.isLoadingChatter = action.payload;
        },
        setIsLoadingOlderSharedFiles: (state, action: { payload: boolean }) => {
            state.isLoadingOlderSharedFiles = action.payload;
        },
        updateSharedFilesCache: (state, action: { payload: {
            sharedFilesListToCache: SharedFile[], pageNumber: number, isLastPage: boolean }
        }) => {
            const valueToCache = {
                cachedSharedFileList: action.payload.sharedFilesListToCache,
                lastRetrievedPageNumber: action.payload.pageNumber,
                isLastPage: action.payload.isLastPage,
                expiresAtTimestamp: TimeHelper.getCurrentTimestamp() + CONSTANTS.LONG_CACHED_ENTRY_EXPIRES_IN_MS
            } as SharedFilesWithChatterCache;

            state.retrievedSharedFilesCache = valueToCache;
        },
        clearSharedFilesCache: (state) => {
            state.retrievedSharedFilesCache = initialState.retrievedSharedFilesCache;
        },
        appendSharedFilesToList: (state, action: { payload: SharedFile[] }) => {
            const mergedSharedFiles = mergeSharedFilePageToList(state.chatter.getSharedFiles(), action.payload);

            // sorting SharedFiles based on the time when they were shared
            const sortedMergedSharedFiles = mergedSharedFiles.toSorted((first, second) => {
                return second.getFileSharedAtTimestamp() - first.getFileSharedAtTimestamp();
            });

            const updatedChatter = Chatter.getShallowCopy(state.chatter as Chatter);
            updatedChatter.setSharedFiles(sortedMergedSharedFiles);
            state.chatter = updatedChatter;
        },
        setCurrentSharedFilesListPage: (state, action: { payload: number }) => {
            state.currentSharedFilesListPage = action.payload;
        },
        setIsLastSharedFilesListPage: (state, action: { payload: boolean }) => {
            state.isLastSharedFilesListPage = action.payload;
        },
        setChatterSharedFileInOverlay: (state, action: { payload: SharedFile | null }) => {
            state.chatterSharedFileInOverlay = action.payload;
        },
        clearChatterState: (state) => {
            state.chatter = initialState.chatter;
            state.isLoadingChatter = initialState.isLoadingChatter;
            state.currentSharedFilesListPage = initialState.currentSharedFilesListPage;
            state.isLastSharedFilesListPage = initialState.isLastSharedFilesListPage;
            state.isLoadingOlderSharedFiles = initialState.isLoadingOlderSharedFiles;
            state.chatterSharedFileInOverlay = initialState.chatterSharedFileInOverlay;
            state.retrievedSharedFilesCache = initialState.retrievedSharedFilesCache;
        }
    }
});

export const {
    setChatter,
    setIsLoadingChatter,
    setIsLoadingOlderSharedFiles,
    updateSharedFilesCache,
    clearSharedFilesCache,
    appendSharedFilesToList,
    setCurrentSharedFilesListPage,
    setIsLastSharedFilesListPage,
    setChatterSharedFileInOverlay,
    clearChatterState
} = ChatterSlice.actions;
