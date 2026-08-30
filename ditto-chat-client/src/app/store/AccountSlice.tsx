import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import { AsyncThunkRejectType } from "./ReduxStore";
import { ChatServerResponseErrorBody } from "../clients/ChatClientInterface";
import ChatClient from "../clients/ChatClient";
import { setNewLoggedInChatterImageUrl } from "./AuthSlice";
import SliceHelper from "../helpers/SliceHelper";
import AccountImageForm from "../classes/AccountImageForm";

interface AccountState {
    isChatterImageBeingUploaded: boolean;
}

const initialState: AccountState = {
    isChatterImageBeingUploaded: false,
};

export const newAccountImage = createAsyncThunk<void, { newAccountImageForm: AccountImageForm }, { rejectValue: AsyncThunkRejectType }>(
    "account/newAccountImage",
    async ({ newAccountImageForm } , thunkAPI) => {
        try {
            const responseBody = await ChatClient.getChatClient().newAccountImage(newAccountImageForm);
            const accountImageFileUrl = responseBody.data.fileUrl;

            thunkAPI.dispatch(setNewLoggedInChatterImageUrl({ newLoggedInChatterImageUrl: accountImageFileUrl }));
            SliceHelper.handleResponseBody(responseBody, thunkAPI);
            
            return thunkAPI.fulfillWithValue(null);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const AccountSlice = createSlice({
    name: "account",
    initialState,
    reducers: {
        setIsChatterImageBeingUploaded: (state, action: { payload: boolean }) => {
            state.isChatterImageBeingUploaded = action.payload;
        },
        clearAccountState: (state) => {
            state.isChatterImageBeingUploaded = false;
        }
    }
});

export const {
    setIsChatterImageBeingUploaded,
    clearAccountState
} = AccountSlice.actions;
