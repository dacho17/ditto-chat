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
    imageBeingUploadedUrl: string | null;  // TODO-image-upload: or something similar. I need to be able to show Image before it is stored in S3 Bucket
}

const initialState: AccountState = {
    isChatterImageBeingUploaded: false,
    imageBeingUploadedUrl: null
};

export const requestAccountImageUploadUrl = createAsyncThunk<S3PreSignedUrlDto, { uploadFileIntent: UploadFileIntent }, AyncThunkRejectType>(
    "account/requestAccountImageUploadUrl",
    async ({ uploadFileIntent } , thunkAPI) => {
        try {
            const res = await ChatClient.getChatClient().requestAccountImageUploadUrl(uploadFileIntent);
            return thunkAPI.fulfillWithValue(res.data);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

// TODO-image-upload: Image Content needs to be passed as another Argument to this Function and sent to AWS
    // Check what does AWS Expect from their side in the Request
    // https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html#API_PutObject_RequestSyntax
export const uploadAccountImageToS3 = createAsyncThunk<S3UploadFileResponseDto, { s3PreSignedUploadUrl: S3PreSignedUrlDto, fileContentStream: ReadableStream }, AyncThunkRejectType>(
    "account/uploadAccountImageToS3",
    async ({ s3PreSignedUploadUrl, fileContentStream } , thunkAPI) => {
        try {
            // const { chatterOverview } = (thunkAPI.getState() as RootState).authSlice;
            const res = await AwsClient.getAwsClient().uploadAccountImageToS3(s3PreSignedUploadUrl, fileContentStream);
            
            // TODO-toasting: likely, show success Message to the Client that they changed their Image
            
            // TODO-image-upload: set chatterOverview ImageUrl to the URL of the uploaded Image
            // thunkAPI.dispatch(setChatterOverview())

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
            state.imageBeingUploadedUrl = null;
            state.isChatterImageBeingUploaded = false;
        }
        // setChatterAccountImage: (state, action: { payload:  }) => {}
            // NOTE: If I will need to Register Uploaded Image in the State, I can use this Reducer
    }
});

export const {
    setIsChatterImageBeingUploaded,
    clearAccountState
} = AccountSlice.actions;
