import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import { AyncThunkRejectType } from "./ReduxStore";
import { ChatServerResponseErrorBody } from "../clients/ChatClientInterface";
import ChatClient from "../clients/ChatClient";
import SliceHelper from "../helpers/SliceHelper";
import Mapper from "../helpers/Mapper";
import LoginForm from "../classes/LoginForm";
import ChatterOverview from "../classes/ChatterOverview";

interface AuthState {
    isCurrentlyAuthenticating: boolean;
    chatterOverview: ChatterOverview | null;
    isLoadingChatterOverview: boolean;
}

const initialState: AuthState = {
    isCurrentlyAuthenticating: false,
    chatterOverview: null,
    isLoadingChatterOverview: true,
};

// TODO-auth: store expiresAt as well
const AUTH_LOCAL_STORAGE_KEYS = {
    chatterId: "chatterId",
    chatterName: "chatterName",
    chatterSurname: "chatterSurname",
    chatterUsername: "chatterUsername",
    chatterImageUrl: "chatterImageUrl",
};

// TODO-auth: All of the Functions bellow need to be Implemented yet. These versions were used for testing.

export const login = createAsyncThunk<{ redirectUrl: string }, LoginForm, AyncThunkRejectType>(
    "auth/login",
    async (loginForm , thunkAPI) => {
        try {
            const res = await ChatClient.getChatClient().login(loginForm);            
            const retrievedChatterOverview = Mapper.chatterOverviewFromDto(res.data.chatterOverview);

            thunkAPI.dispatch(setChatterOverview(retrievedChatterOverview));

            return thunkAPI.fulfillWithValue({ redirectUrl: res.data.redirectUrl });
        } catch (err: any) {
            const redirectUrlOrNull = SliceHelper.handleAxiosErrorResponse(err as AxiosResponse<ChatServerResponseErrorBody>, thunkAPI);
            return thunkAPI.rejectWithValue(redirectUrlOrNull);
        }
    }
);

export const logout = createAsyncThunk<{ redirectUrl: string }, void, AyncThunkRejectType>(
    "auth/logout",
    async (_, thunkAPI) => {
        try {
            const res = await ChatClient.getChatClient().logout();

            thunkAPI.dispatch(clearAuthState());

            return thunkAPI.fulfillWithValue(res.data);
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
        setChatterOverview: (state, action: { payload: ChatterOverview }) => {
            localStorage.setItem(AUTH_LOCAL_STORAGE_KEYS.chatterId, action.payload.getId());
            localStorage.setItem(AUTH_LOCAL_STORAGE_KEYS.chatterName, action.payload.getChatterName());
            localStorage.setItem(AUTH_LOCAL_STORAGE_KEYS.chatterSurname, action.payload.getChatterSurname());
            localStorage.setItem(AUTH_LOCAL_STORAGE_KEYS.chatterUsername, action.payload.getChatterUsername());
            localStorage.setItem(AUTH_LOCAL_STORAGE_KEYS.chatterImageUrl, action.payload.getChatterImageUrl());

            state.chatterOverview = action.payload;
        },
        refreshChatterOverview: (state) => {
            if (state.chatterOverview !== null) {
                return;     // if ChatterOverview is already Set in State it does not have to be Stored in the State
            }

            const chatterId = localStorage.getItem(AUTH_LOCAL_STORAGE_KEYS.chatterId);
            if (chatterId === null) {
                return;     // if ChatterOverviewId is not stored in Web Browser, it can not be Stored in the State and needs to be retrieved from the Server
            }

            // get ChatterOverview from Web Browser Local Storage
            const chatterName = localStorage.getItem(AUTH_LOCAL_STORAGE_KEYS.chatterName);
            const chatterSurname = localStorage.getItem(AUTH_LOCAL_STORAGE_KEYS.chatterSurname);
            const chatterUsername = localStorage.getItem(AUTH_LOCAL_STORAGE_KEYS.chatterUsername);
            const chatterImageUrl = localStorage.getItem(AUTH_LOCAL_STORAGE_KEYS.chatterImageUrl);
            const chatterOverview = new ChatterOverview(
                chatterId, chatterName, chatterSurname, chatterUsername, chatterImageUrl, true, null
            );

            state.chatterOverview = chatterOverview;
        },
        setNewLoggedInChatterImageUrl: (state, action: { payload: { newLoggedInChatterImageUrl: string }}) => {
            localStorage.setItem(AUTH_LOCAL_STORAGE_KEYS.chatterImageUrl, action.payload.newLoggedInChatterImageUrl);

            const updatedLoggedInChatter = ChatterOverview.getShallowCopy(state.chatterOverview as ChatterOverview);
            updatedLoggedInChatter.setChatterImageUrl(action.payload.newLoggedInChatterImageUrl);

            state.chatterOverview = updatedLoggedInChatter;
        },
        clearAuthState: (state) => {            
            localStorage.removeItem(AUTH_LOCAL_STORAGE_KEYS.chatterId);
            localStorage.removeItem(AUTH_LOCAL_STORAGE_KEYS.chatterName);
            localStorage.removeItem(AUTH_LOCAL_STORAGE_KEYS.chatterSurname);
            localStorage.removeItem(AUTH_LOCAL_STORAGE_KEYS.chatterUsername);
            localStorage.removeItem(AUTH_LOCAL_STORAGE_KEYS.chatterImageUrl);

            state.chatterOverview = initialState.chatterOverview;
            state.isLoadingChatterOverview = initialState.isLoadingChatterOverview;
            state.isCurrentlyAuthenticating = initialState.isCurrentlyAuthenticating;
        }
    }
});

export const {
    setIsCurrentlyAuthenticating,
    setIsLoadingChatterOverview,
    setChatterOverview,
    refreshChatterOverview,
    setNewLoggedInChatterImageUrl,
    clearAuthState
} = AuthSlice.actions;
