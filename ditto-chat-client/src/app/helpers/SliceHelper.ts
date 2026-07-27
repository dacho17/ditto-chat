import { AxiosResponse } from "axios";
import { GetThunkAPI } from "@reduxjs/toolkit";
import { ChatServerResponseErrorBody } from "../clients/ChatClientInterface";

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
}
