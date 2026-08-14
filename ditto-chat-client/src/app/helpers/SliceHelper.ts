import { AxiosResponse } from "axios";
import { GetThunkAPI } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { ChatServerResponseBody, ChatServerResponseErrorBody } from "../clients/ChatClientInterface";
import { AsyncThunkRejectType } from "../store/ReduxStore";
import { clearChatterState, getChatter, setIsLoadingChatter } from "../store/ChatterSlice";
import { clearChatState, getChatThread, setIsLoadingChatThread } from "../store/ChatSlice";
import { clearHomeState, getChatThreadsOnHomePage } from "../store/HomeSlice";
import { clearAccountState } from "../store/AccountSlice";
import { clearChattersState, getChatters } from "../store/ChattersSlice";
import { clearAuthState, logout, refreshChatterOverview } from "../store/AuthSlice";
import { clearUrlHistoryState, refreshUrlHistory } from "../store/UrlHistorySlice";
import ChatThreadOverview from "../classes/ChatThreadOverview";
import CONSTANTS from "../../Constants";

export default class SliceHelper {
    public static handleAxiosErrorResponse(axiosErrorResponse: AxiosResponse<ChatServerResponseErrorBody>, thunkAPI: GetThunkAPI<any>): AsyncThunkRejectType {
        const errorMessageToBeDisplayed = axiosErrorResponse.data.message !== null
            ? axiosErrorResponse.data.message : CONSTANTS.UNEXPECTED_ERROR_CLIENT_MESSAGE;
        toast.error(errorMessageToBeDisplayed);

        const redirectUrl = axiosErrorResponse.data.data !== null
            ? axiosErrorResponse.data.data.redirectUrl
            : null;

        const responseHttpCode = axiosErrorResponse.status;
        return {
            responseHttpCode: responseHttpCode,
            redirectUrl: redirectUrl
        }
    }

    public static toastSuccessResponseMessage(responseBody: ChatServerResponseBody<any>): void {
        if (responseBody.message !== null) {
            toast.success(responseBody.message);
        }
    }

    public static clearPageStates(dispatch: Function): void {
        dispatch(clearHomeState());
        dispatch(clearAccountState());
        dispatch(clearChattersState());
        dispatch(clearChatterState());
        dispatch(clearChatState());

        dispatch(refreshUrlHistory());
        dispatch(refreshChatterOverview());
    }

    public static clearAllStates(dispatch: Function): void {
        SliceHelper.clearPageStates(dispatch);
        dispatch(clearUrlHistoryState());
        dispatch(clearAuthState());
    }

    public static async tryToGetChatter(chatterId: string,
        sendTryToGetChatter: (tryToSendRequestFunction: () => Promise<null>, finallyFunction: () => void) => Promise<null>,
    dispatch: Function): Promise<void> {
        if (chatterId === null) {
            toast.error(CONSTANTS.INCOMPLETE_REQUEST_CLIENT_MESSAGE);
            return;
        }

        await sendTryToGetChatter(async () => {
            dispatch(setIsLoadingChatter(true));

            await dispatch(getChatter({ chatterId: chatterId }));
            return null;
        }, () => dispatch(setIsLoadingChatter(false)));
    }

    public static async tryToGetChatThread(chatThreadId: string,
        sendTryToGetChatThread: (tryToSendRequestFunction: () => Promise<null>, finallyFunction: () => void) => Promise<null>,
    dispatch: Function): Promise<void> {
        if (chatThreadId === null) {
            toast.error(CONSTANTS.INCOMPLETE_REQUEST_CLIENT_MESSAGE);
            return;
        }

        await sendTryToGetChatThread(async () => {
            dispatch(setIsLoadingChatThread(true));
    
            await dispatch(getChatThread({ chatThreadId: chatThreadId }));
            return null;
        }, () => dispatch(setIsLoadingChatThread(false)));
    }

    public static async tryToGetChatThreads(queryParams: URLSearchParams, currentlySelectedChatThread: ChatThreadOverview | null, isInitialRetrieval: boolean,
        sendTryToGetChatThreads: (tryToSendRequestFunction: () => Promise<ChatThreadOverview[]>, finallyFunction: () => void) => Promise<ChatThreadOverview[]>,
    isLoadingReducer: Function, dispatch: Function): Promise<ChatThreadOverview[]> {
        const chatThreadSearchFilter = queryParams.get(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER);
        const currentPageNumber = queryParams.get(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER);

        if (chatThreadSearchFilter === null || currentPageNumber === null) {
            toast.error(CONSTANTS.INCOMPLETE_REQUEST_CLIENT_MESSAGE);
            return;
        }

        return await sendTryToGetChatThreads(async () => {
            dispatch(isLoadingReducer(true));

            // TODO-result-caching: For Optimization, include whether Search was attempted before in Cache, and use the list of restults if yes. I will have to store pageNumber as well in the cache
            const retrievedChatThreadOverviews = await dispatch(getChatThreadsOnHomePage({
                chatThreadSearchFilter: chatThreadSearchFilter,
                currentPageNumber: currentPageNumber,
                currentlySelectedChatThreadId: currentlySelectedChatThread !== null
                    ? currentlySelectedChatThread.getId() : null,
                isInitialRetrieval: isInitialRetrieval,
                isPolling: false,
            })).unwrap();
            // TODO-result-caching: if using Cache, store the retrieved result (retrievedChatThreadOverviews) in the Cache
            
            return retrievedChatThreadOverviews;
        }, () => dispatch(isLoadingReducer(false)));
    }

    public static async tryToGetChatters(queryParams: URLSearchParams, isInitialRetrieval: boolean,
        sendTryToGetChatters: (tryToSendRequestFunction: () => Promise<null>, finallyFunction: () => void) => Promise<null>,
    isLoadingReducer: Function, dispatch: Function): Promise<void> {
        const chattersSearchFilter = queryParams.get(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER);
        const currentPageNumber = queryParams.get(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER);

        if (chattersSearchFilter === null || currentPageNumber === null) {
            toast.error(CONSTANTS.INCOMPLETE_REQUEST_CLIENT_MESSAGE);
            return;
        }

        await sendTryToGetChatters(async () => {
            dispatch(isLoadingReducer(true));

            // TODO-result-caching: For Optimization, include whether Search was attempted before in Cache, and use the list of restults if yes. I will have to store pageNumber as well in the cache
            await dispatch(getChatters({ chatterSearchFilter: chattersSearchFilter, currentPageNumber: currentPageNumber, isInitialRetrieval: isInitialRetrieval })).unwrap();
            // TODO-result-caching: if using Cache, store the retrieved result (retrievedChatThreadOverviews) in the Cache
            
            return null;
        }, () => dispatch(isLoadingReducer(false)));
    }

    public static async tryToLogout(
        sendTryToLogout: (tryToSendRequestFunction: () => Promise<{ redirectUrl: string }>, finallyFunction: () => void) => Promise<null>,
    dispatch: Function): Promise<void> {
        await sendTryToLogout(async () => {
            const responseBody =  await dispatch(logout()).unwrap();
            SliceHelper.clearAllStates(dispatch);

            return responseBody;
        }, () => {});
    }
}
