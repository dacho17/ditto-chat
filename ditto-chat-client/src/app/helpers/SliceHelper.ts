import { AxiosResponse } from "axios";
import { GetThunkAPI } from "@reduxjs/toolkit";
import { ChatServerResponseErrorBody } from "../clients/ChatClientInterface";
import { clearChatterState, getChatter, setIsLoadingChatter } from "../store/ChatterSlice";
import { clearChatState, getChatThread, setIsLoadingChatThread } from "../store/ChatSlice";
import { clearHomeState, getChatThreads } from "../store/HomeSlice";
import { clearAccountState } from "../store/AccountSlice";
import { clearChattersState, getChatters } from "../store/ChattersSlice";
import { clearAuthState, logout, refreshChatterOverview } from "../store/AuthSlice";
import { clearUrlHistoryState, refreshUrlHistory } from "../store/UrlHistorySlice";
import ChatThreadOverview from "../classes/ChatThreadOverview";
import ChatterOverview from "../classes/ChatterOverview";
import CONSTANTS from "../../Constants";

export default class SliceHelper {
    public static handleAxiosErrorResponse(err: AxiosResponse<ChatServerResponseErrorBody>, thunkAPI: GetThunkAPI<any>): { redirectUrl: string } | null {
        // const axiosErrorResponse = err as AxiosResponse<BookingRestApiResponseObject<RedirectResponseObject | null>>;

        // TODO: if errorResponseMessage is received, display it in Notification Bubble (Toast)
        // const errorResponseMessage = err.data.message;
        // const errorMessage = NotificationMessageMapper.newNotificationMessage(
        //     thunkErrorResponse.message || CONSTANTS.UNEXPECTED_ERROR_CLIENT_MESSAGE, NotificationMessageType.ACTION_FAILED);
        // thunkAPI.dispatch(addNotification(errorMessage));


        const redirectUrl = err.data.data !== null
            ? err.data.data.redirectUrl : null;
        return redirectUrl !== null ? {
            redirectUrl: redirectUrl   
        }: null;
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

    public static async tryGetChatter(chatterId: string, dispatch: Function): Promise<void> {
        dispatch(setIsLoadingChatter(true));
        
        try {
            await dispatch(getChatter({ chatterId: chatterId }));
        } catch (err) {
            console.log(`TODO err must be handled: ${JSON.stringify(err)}.`);
        } finally {
            dispatch(setIsLoadingChatter(false));
        }
    }

    public static async tryGetChatThread(chatThreadId: string, dispatch: Function): Promise<void> {
        dispatch(setIsLoadingChatThread(true));

        try {
            await dispatch(getChatThread({ chatThreadId: chatThreadId }));
        } catch (err) {
            console.log(`TODO err must be handled: ${JSON.stringify(err)}.`);
        } finally {
            dispatch(setIsLoadingChatThread(false));
        }
    }

    public static async tryGetChatThreads(chatThreadSearchFilter: string, currentPageNumber: string, currentlySelectedChatThread: ChatThreadOverview | null, isInitialRetrieval: boolean, isLoadingReducer: Function, dispatch: Function): Promise<ChatThreadOverview[]> {
        dispatch(isLoadingReducer(true));
        // TODO: For Optimization, include whether Search was attempted before in Cache, and use the list of restults if yes. I will have to store pageNumber as well in the cache

        try {
            const retrievedChatThreadOverviews = await dispatch(getChatThreads({
                chatThreadSearchFilter: chatThreadSearchFilter,
                currentPageNumber: currentPageNumber,
                currentlySelectedChatThread: currentlySelectedChatThread,
                isInitialRetrieval: isInitialRetrieval
            })).unwrap();

            // TODO: if using Cache, store the retrieved result (retrievedChatThreadOverviews) in the Cache
            return retrievedChatThreadOverviews;
        } catch (err: any) {
            console.log(`TODO err must be handled: ${JSON.stringify(err)}.`);
        } finally {
            dispatch(isLoadingReducer(false));
        }
    }

    public static async tryGetChatters(chattersSearchFilter: string, currentPageNumber: string, isInitialRetrieval: boolean, isLoadingReducer: Function, dispatch: Function): Promise<ChatterOverview[]> {
        dispatch(isLoadingReducer(true));
        
        // TODO: For Optimization, include whether Search was attempted before in Cache, and use the list of restults if yes. I will have to store pageNumber as well in the cache

        try {
            const retrievedChatterOverviews = await dispatch(getChatters({ chatterSearchFilter: chattersSearchFilter, currentPageNumber: currentPageNumber, isInitialRetrieval: isInitialRetrieval })).unwrap();

            // TODO: if using Cache, store the retrieved result (retrievedChatThreadOverviews) in the Cache
            return retrievedChatterOverviews;
        } catch (err: any) {
            console.log(`TODO err must be handled: ${JSON.stringify(err)}.`);
        } finally {
            dispatch(isLoadingReducer(false));
        }
    }

    public static async tryLogout(dispatch: Function): Promise<string> {
        const redirectUrl = await dispatch(logout()).unwrap();  // TODO: get redirectUrl from response and navigate there
        SliceHelper.clearAllStates(dispatch);
        return CONSTANTS.LOGIN_URL; // redirectUrl
    }
}
