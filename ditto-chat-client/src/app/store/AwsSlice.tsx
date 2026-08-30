import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import { AsyncThunkRejectType } from "./ReduxStore";
import { ChatServerResponseErrorBody } from "../clients/ChatClientInterface";
import AwsClient from "../clients/AwsClient";
import ChatClient from "../clients/ChatClient";
import SliceHelper from "../helpers/SliceHelper";
import Mapper from "../helpers/Mapper";
import S3PreSignedUrl from "../classes/S3PreSignedUrl";
import UploadFileIntent from "../classes/UploadFileIntent";
import S3UploadFileResponseDto from "../interfaces/S3UploadFileResponseDto";

interface AwsState {}
const initialState: AwsState = {};

export const newUploadFileIntent = createAsyncThunk<S3PreSignedUrl, { uploadFileIntentForm: UploadFileIntent }, { rejectValue: AsyncThunkRejectType }>(
    "aws/newUploadFileIntent",
    async ({ uploadFileIntentForm } , thunkAPI) => {
        try {
            const responseBody = await ChatClient.getChatClient().newUploadFileIntent(uploadFileIntentForm);
            const s3PreSignedUrl = Mapper.s3PreSignedUrlFromDto(responseBody.data);
            SliceHelper.handleResponseBody(responseBody, thunkAPI);
            
            return thunkAPI.fulfillWithValue(s3PreSignedUrl);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

// https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html#API_PutObject_RequestSyntax
export const uploadFileToS3Bucket = createAsyncThunk<S3UploadFileResponseDto, { s3PreSignedUploadUrl: S3PreSignedUrl, fileContentStream: ReadableStream }, { rejectValue: AsyncThunkRejectType }>(
    "aws/uploadFileToS3Bucket",
    async ({ s3PreSignedUploadUrl, fileContentStream } , thunkAPI) => {
        try {
            const res = await AwsClient.getAwsClient().uploadFileToS3Bucket(s3PreSignedUploadUrl, fileContentStream);
            return thunkAPI.fulfillWithValue(res);
        } catch (err: any) {
            // TODO-aws: possibly AWS Sends special Error Types Back on S3 Image Upload. I may not be able to use ChatClientResponseErrorBody. Look into this!
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const AwsSlice = createSlice({
    name: "aws",
    initialState,
    reducers: {}
});

export const {} = AwsSlice.actions;
