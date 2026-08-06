import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import { AyncThunkRejectType, RootState } from "./ReduxStore";
import { ChatServerResponseErrorBody } from "../clients/ChatClientInterface";
import ChatClient from "../clients/ChatClient";
import SliceHelper from "../helpers/SliceHelper";
import Mapper from "../helpers/Mapper";
import Chatter from "../classes/Chatter";
import SharedFile from "../classes/SharedFile";
import CONSTANTS from "../../Constants";

interface ChatterState {
    chatter: Chatter | null;   // contains List of SharedFiles sorted descendingly temporaly at all times!
    isLoadingChatter: boolean;
    currentSharedFilesListPage: number;
    isLastSharedFilesListPage: boolean;
    isLoadingOlderSharedFiles: boolean;
    isImageEnlarged: boolean;
}

const initialState: ChatterState = {
    chatter: null,
    isLoadingChatter: true,
    currentSharedFilesListPage: 0,
    isLastSharedFilesListPage: false,
    isLoadingOlderSharedFiles: false,
    isImageEnlarged: false
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

export const getChatter = createAsyncThunk<Chatter, { chatterId: string }, AyncThunkRejectType>(
    "chatter/getChatter",
    async ({ chatterId }, thunkAPI) => {
        try {
            const res = await ChatClient.getChatClient().getChatter(chatterId);
            const retrievedChatter = Mapper.chatterFromDto(res.data);

            thunkAPI.dispatch(setChatter(retrievedChatter));
            if (retrievedChatter.getSharedFiles().length < CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE) {
                thunkAPI.dispatch(setIsLastSharedFilesListPage(true));
            }

            return thunkAPI.fulfillWithValue(retrievedChatter);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const getSharedFiles = createAsyncThunk<SharedFile[], { chatterId: string }, AyncThunkRejectType>(
    "chatter/getSharedFiles",
    async ({ chatterId }, thunkAPI) => {
        try {
            const { currentSharedFilesListPage } = (thunkAPI.getState() as RootState).chatterSlice;

            const queryParams = new URLSearchParams();
            queryParams.set(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER, currentSharedFilesListPage.toString());
            
            const retrievedSharedFiles = await ChatClient.getChatClient().getSharedFiles(chatterId, queryParams);
            const { pagedList, isLastPage } = retrievedSharedFiles.data;

            const sharedFiles = pagedList.map(sharedFileDto => Mapper.sharedFileFromDto(sharedFileDto));
            thunkAPI.dispatch(appendSharedFilesToList(sharedFiles));
            thunkAPI.dispatch(setIsLastSharedFilesListPage(isLastPage));

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
        setIsImageEnlarged: (state, action: { payload: boolean }) => {
            state.isImageEnlarged = action.payload;
        },
        clearChatterState: (state) => {
            state.chatter = initialState.chatter;
            state.isLoadingChatter = initialState.isLoadingChatter;
            state.currentSharedFilesListPage = initialState.currentSharedFilesListPage;
            state.isLastSharedFilesListPage = initialState.isLastSharedFilesListPage;
            state.isLoadingOlderSharedFiles = initialState.isLoadingOlderSharedFiles;
            state.isImageEnlarged = initialState.isImageEnlarged;
        }
    }
});

export const {
    setChatter,
    setIsLoadingChatter,
    setIsLoadingOlderSharedFiles,
    appendSharedFilesToList,
    setCurrentSharedFilesListPage,
    setIsLastSharedFilesListPage,
    setIsImageEnlarged,
    clearChatterState
} = ChatterSlice.actions;
