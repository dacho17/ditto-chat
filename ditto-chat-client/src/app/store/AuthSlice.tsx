import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import { AsyncThunkRejectType } from "./ReduxStore";
import { ChatServerResponseErrorBody } from "../clients/ChatClientInterface";
import ChatClient from "../clients/ChatClient";
import SliceHelper from "../helpers/SliceHelper";
import TypeFormatter from "../helpers/TypeFormatter";
import Mapper from "../helpers/Mapper";
import ChatterRegistrationForm from "../classes/ChatterRegistrationForm";
import LoginForm from "../classes/LoginForm";
import ForgotPasswordForm from "../classes/ForgotPasswordForm";
import ResetPasswordForm from "../classes/ResetPasswordForm";
import ChatterOverview from "../classes/ChatterOverview";
import LoginDto from "../interfaces/LoginDto";

const AUTH_LOCAL_STORAGE_KEYS = {
    chatterId: "chatterId",
    chatterName: "chatterName",
    chatterSurname: "chatterSurname",
    chatterUsername: "chatterUsername",
    chatterEmail: "chatterEmail",
    chatterImageUrl: "chatterImageUrl",
    sessionExpiresAtTimestamp: "sessionExpiresAtTimestamp"
};

interface AuthState {
    isCurrentlyAuthenticating: boolean;
    chatterOverview: ChatterOverview | null;
    isLoadingChatterOverview: boolean;

    sessionExpiresAtTimestamp: number | null;
}

const initialState: AuthState = {
    isCurrentlyAuthenticating: false,
    chatterOverview: localStorage.getItem(AUTH_LOCAL_STORAGE_KEYS.chatterId) !== null
        ? new ChatterOverview(
            localStorage.getItem(AUTH_LOCAL_STORAGE_KEYS.chatterId),
            localStorage.getItem(AUTH_LOCAL_STORAGE_KEYS.chatterName),
            localStorage.getItem(AUTH_LOCAL_STORAGE_KEYS.chatterSurname),
            localStorage.getItem(AUTH_LOCAL_STORAGE_KEYS.chatterUsername),
            localStorage.getItem(AUTH_LOCAL_STORAGE_KEYS.chatterEmail),
            localStorage.getItem(AUTH_LOCAL_STORAGE_KEYS.chatterImageUrl) !== null && localStorage.getItem(AUTH_LOCAL_STORAGE_KEYS.chatterImageUrl) !== "null"
                ? localStorage.getItem(AUTH_LOCAL_STORAGE_KEYS.chatterImageUrl) : null,
            true,
            null
        )
        : null,
    isLoadingChatterOverview: true,

    sessionExpiresAtTimestamp: localStorage.getItem(AUTH_LOCAL_STORAGE_KEYS.sessionExpiresAtTimestamp) !== null
        ? TypeFormatter.stringToInt(localStorage.getItem(AUTH_LOCAL_STORAGE_KEYS.sessionExpiresAtTimestamp)) : null
};

function clearAuthStateHelper(state: AuthState): void {
    localStorage.removeItem(AUTH_LOCAL_STORAGE_KEYS.chatterId);
    localStorage.removeItem(AUTH_LOCAL_STORAGE_KEYS.chatterName);
    localStorage.removeItem(AUTH_LOCAL_STORAGE_KEYS.chatterSurname);
    localStorage.removeItem(AUTH_LOCAL_STORAGE_KEYS.chatterUsername);
    localStorage.removeItem(AUTH_LOCAL_STORAGE_KEYS.chatterEmail);
    localStorage.removeItem(AUTH_LOCAL_STORAGE_KEYS.chatterImageUrl);
    localStorage.removeItem(AUTH_LOCAL_STORAGE_KEYS.sessionExpiresAtTimestamp);

    state.chatterOverview = initialState.chatterOverview;
    state.isLoadingChatterOverview = initialState.isLoadingChatterOverview;
    state.isCurrentlyAuthenticating = initialState.isCurrentlyAuthenticating;
    state.sessionExpiresAtTimestamp = initialState.sessionExpiresAtTimestamp;
}

export const getRegisterPage = createAsyncThunk<{ redirectUrl: string } | null, void, { rejectValue: AsyncThunkRejectType }>(
    "auth/getRegisterPage",
    async (_, thunkAPI) => {
        try {
            const responseBody = await ChatClient.getChatClient().getRegister();
            SliceHelper.handleResponseBody(responseBody, thunkAPI);

            return thunkAPI.fulfillWithValue(responseBody.data);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const register = createAsyncThunk<{ redirectUrl: string }, { registrationForm: ChatterRegistrationForm }, { rejectValue: AsyncThunkRejectType }>(
    "auth/register",
    async ({ registrationForm } , thunkAPI) => {
        try {
            const responseBody = await ChatClient.getChatClient().register(registrationForm);
            SliceHelper.handleResponseBody(responseBody, thunkAPI);

            return thunkAPI.fulfillWithValue(responseBody.data);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const getLoginPage = createAsyncThunk<{ redirectUrl: string } | null, void, { rejectValue: AsyncThunkRejectType }>(
    "auth/getLoginPage",
    async (_, thunkAPI) => {
        try {
            const responseBody = await ChatClient.getChatClient().getLogin();
            SliceHelper.handleResponseBody(responseBody, thunkAPI);

            return thunkAPI.fulfillWithValue(responseBody.data);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const login = createAsyncThunk<{ redirectUrl: string }, { loginForm: LoginForm }, { rejectValue: AsyncThunkRejectType }>(
    "auth/login",
    async ({ loginForm } , thunkAPI) => {
        try {
            const responseBody = await ChatClient.getChatClient().login(loginForm);
            SliceHelper.handleResponseBody(responseBody, thunkAPI);
            if ('chatterOverview' in responseBody.data) {
                const loginDto = responseBody.data as LoginDto;
                const retrievedChatterOverview = Mapper.chatterOverviewFromDto(loginDto.chatterOverview);

                thunkAPI.dispatch(setChatterOverview({ loggedInChatterOverview: retrievedChatterOverview }));
            }

            return thunkAPI.fulfillWithValue({ redirectUrl: responseBody.data.redirectUrl });
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const getForgotPasswordPage = createAsyncThunk<{ redirectUrl: string } | null, void, { rejectValue: AsyncThunkRejectType }>(
    "auth/getForgotPasswordPage",
    async (_, thunkAPI) => {
        try {
            const responseBody = await ChatClient.getChatClient().getForgotPasswordPage();
            SliceHelper.handleResponseBody(responseBody, thunkAPI);
        
            return thunkAPI.fulfillWithValue(responseBody.data);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const forgotPassword = createAsyncThunk<{ redirectUrl: string } | null, { forgotPasswordForm: ForgotPasswordForm }, { rejectValue: AsyncThunkRejectType }>(
    "auth/forgotPassword",
    async ({ forgotPasswordForm } , thunkAPI) => {
        try {
            const responseBody = await ChatClient.getChatClient().forgotPassword(forgotPasswordForm);
            SliceHelper.handleResponseBody(responseBody, thunkAPI);

            return thunkAPI.fulfillWithValue(responseBody.data);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const getResetPasswordPage = createAsyncThunk<{ redirectUrl: string } | null, void, { rejectValue: AsyncThunkRejectType }>(
    "auth/getResetPasswordPage",
    async (_, thunkAPI) => {
        try {
            const responseBody = await ChatClient.getChatClient().getResetPasswordPage();
            SliceHelper.handleResponseBody(responseBody, thunkAPI);

            return thunkAPI.fulfillWithValue(responseBody.data);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const resetPassword = createAsyncThunk<{ redirectUrl: string }, { passwordResetToken: string, resetPasswordForm: ResetPasswordForm }, { rejectValue: AsyncThunkRejectType }>(
    "auth/resetPassword",
    async ({ passwordResetToken, resetPasswordForm } , thunkAPI) => {
        try {
            const responseBody = await ChatClient.getChatClient().resetPassword(passwordResetToken, resetPasswordForm);
            SliceHelper.handleResponseBody(responseBody, thunkAPI);

            return thunkAPI.fulfillWithValue(responseBody.data);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const logout = createAsyncThunk<{ redirectUrl: string }, void, { rejectValue: AsyncThunkRejectType }>(
    "auth/logout",
    async (_, thunkAPI) => {
        try {
            const responseBody = await ChatClient.getChatClient().logout();
            SliceHelper.handleResponseBody(responseBody, thunkAPI);

            thunkAPI.dispatch(clearAuthState());

            return thunkAPI.fulfillWithValue(responseBody.data);
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const AuthSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setIsCurrentlyAuthenticating: (state, action: { payload: boolean }) => {
            state.isCurrentlyAuthenticating = action.payload;
        },
        setIsLoadingChatterOverview: (state, action: { payload: boolean }) => {
            state.isLoadingChatterOverview = action.payload;
        },
        setChatterOverview: (state, action: { payload: { loggedInChatterOverview: ChatterOverview } }) => {
            localStorage.setItem(AUTH_LOCAL_STORAGE_KEYS.chatterId, action.payload.loggedInChatterOverview.getId());
            localStorage.setItem(AUTH_LOCAL_STORAGE_KEYS.chatterName, action.payload.loggedInChatterOverview.getChatterName());
            localStorage.setItem(AUTH_LOCAL_STORAGE_KEYS.chatterSurname, action.payload.loggedInChatterOverview.getChatterSurname());
            localStorage.setItem(AUTH_LOCAL_STORAGE_KEYS.chatterUsername, action.payload.loggedInChatterOverview.getChatterUsername());
            localStorage.setItem(AUTH_LOCAL_STORAGE_KEYS.chatterEmail, action.payload.loggedInChatterOverview.getChatterEmail());
            localStorage.setItem(AUTH_LOCAL_STORAGE_KEYS.chatterImageUrl, action.payload.loggedInChatterOverview.getChatterImageUrl());

            state.chatterOverview = action.payload.loggedInChatterOverview;
        },
        setAuthSessionExpiresAtTimestamp: (state, action: { payload: { authSessionExpiresAtTimestamp: number | null }}) => {
            if (action.payload.authSessionExpiresAtTimestamp !== null) {
                localStorage.setItem(AUTH_LOCAL_STORAGE_KEYS.sessionExpiresAtTimestamp, action.payload.authSessionExpiresAtTimestamp.toString());    
            } else {
                localStorage.setItem(AUTH_LOCAL_STORAGE_KEYS.sessionExpiresAtTimestamp, null);
            }

            state.sessionExpiresAtTimestamp = action.payload.authSessionExpiresAtTimestamp;
        },
        setNewLoggedInChatterImageUrl: (state, action: { payload: { newLoggedInChatterImageUrl: string }}) => {
            localStorage.setItem(AUTH_LOCAL_STORAGE_KEYS.chatterImageUrl, action.payload.newLoggedInChatterImageUrl);

            const updatedLoggedInChatter = ChatterOverview.getShallowCopy(state.chatterOverview as ChatterOverview);
            updatedLoggedInChatter.setChatterImageUrl(action.payload.newLoggedInChatterImageUrl);

            state.chatterOverview = updatedLoggedInChatter;
        },
        clearAuthState: (state) => {
            clearAuthStateHelper(state as AuthState);
        }
    }
});

export const {
    setIsCurrentlyAuthenticating,
    setIsLoadingChatterOverview,
    setChatterOverview,
    setAuthSessionExpiresAtTimestamp,
    setNewLoggedInChatterImageUrl,
    clearAuthState
} = AuthSlice.actions;
