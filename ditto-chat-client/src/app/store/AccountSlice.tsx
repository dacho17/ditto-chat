import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import toast from "react-hot-toast";
import { AsyncThunkRejectType } from "./ReduxStore";
import { ChatServerResponseErrorBody } from "../clients/ChatClientInterface";
import ChatClient from "../clients/ChatClient";
import AwsClient from "../clients/AwsClient";
import SliceHelper from "../helpers/SliceHelper";
import Mapper from "../helpers/Mapper";
import UploadFileIntent from "../classes/UploadFileIntent";
import S3PreSignedUrl from "../classes/S3PreSignedUrl";
import S3UploadFileResponseDto from "../interfaces/S3UploadFileResponseDto";
import CONSTANTS from "../../Constants";

interface AccountState {
    isChatterImageBeingUploaded: boolean;
}

const initialState: AccountState = {
    isChatterImageBeingUploaded: false,
};

export const requestAccountImageUploadUrl = createAsyncThunk<S3PreSignedUrl, { uploadFileIntent: UploadFileIntent }, { rejectValue: AsyncThunkRejectType }>(
    "account/requestAccountImageUploadUrl",
    async ({ uploadFileIntent } , thunkAPI) => {
        try {
            const res = await ChatClient.getChatClient().requestFileUploadUrl(uploadFileIntent);
            const S3PreSignedUrl = Mapper.s3PreSignedUrlFromDto(res.data);
            
            return thunkAPI.fulfillWithValue(S3PreSignedUrl);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

// https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html#API_PutObject_RequestSyntax
export const uploadAccountImageToS3 = createAsyncThunk<S3UploadFileResponseDto, { s3PreSignedUploadUrl: S3PreSignedUrl, fileContentStream: ReadableStream }, { rejectValue: AsyncThunkRejectType }>(
    "account/uploadAccountImageToS3",
    async ({ s3PreSignedUploadUrl, fileContentStream } , thunkAPI) => {
        try {
            const res = await AwsClient.getAwsClient().uploadFileToS3(s3PreSignedUploadUrl, fileContentStream);
            toast.success(CONSTANTS.ACCOUNT_IMAGE_CHANGED_SUCCESSS_CLIENT_MESSAGE);

            return thunkAPI.fulfillWithValue(res);
        } catch (err: any) {
            // TODO-aws: possibly AWS Sends special Error Types Back on S3 Image Upload. I may not be able to use ChatClientResponseErrorBody. Look into this!
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
