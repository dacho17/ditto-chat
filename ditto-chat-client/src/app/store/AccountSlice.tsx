import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import { AyncThunkRejectType } from "./ReduxStore";
import { ChatServerResponseErrorBody } from "../clients/ChatClientInterface";
import ChatClient from "../clients/ChatClient";
import AwsClient from "../clients/AwsClient";
import SliceHelper from "../helpers/SliceHelper";
import UploadFileIntent from "../classes/UploadFileIntent";
import S3PreSignedUrlDto from "../interfaces/S3PreSignedUrlDto";
import S3UploadFileResponseDto from "../interfaces/S3UploadFileResponseDto";

interface AccountState {
    isChatterImageBeingUploaded: boolean;
}

const initialState: AccountState = {
    isChatterImageBeingUploaded: false,
};

export const requestAccountImageUploadUrl = createAsyncThunk<S3PreSignedUrlDto, { uploadFileIntent: UploadFileIntent }, AyncThunkRejectType>(
    "account/requestAccountImageUploadUrl",
    async ({ uploadFileIntent } , thunkAPI) => {
        try {
            const res = await ChatClient.getChatClient().requestFileUploadUrl(uploadFileIntent);
            return thunkAPI.fulfillWithValue(res.data);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

// https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html#API_PutObject_RequestSyntax
export const uploadAccountImageToS3 = createAsyncThunk<S3UploadFileResponseDto, { s3PreSignedUploadUrl: S3PreSignedUrlDto, fileContentStream: ReadableStream }, AyncThunkRejectType>(
    "account/uploadAccountImageToS3",
    async ({ s3PreSignedUploadUrl, fileContentStream } , thunkAPI) => {
        try {
            const res = await AwsClient.getAwsClient().uploadFileToS3(s3PreSignedUploadUrl, fileContentStream);
            
            // TODO-toasting: likely, show success Message to the Client that they changed their Image

            return thunkAPI.fulfillWithValue(res);
        } catch (err: any) {
            // TODO-toasting: possibly AWS Sends special Error Types Back on S3 Image Upload. I may not be able to use ChatClientResponseErrorBody. Look into this!
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
