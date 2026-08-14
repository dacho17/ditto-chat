import { DeviceType } from "../enums/DeviceType";
import CONSTANTS from "../../Constants";

export default class NavigationHelper {
    public static navigateToInitialHome(navigate: Function, currentPageUrl: string): void {
        NavigationHelper.navigateIfNotOnPage(navigate, CONSTANTS.HOME_URL, currentPageUrl);
    }

    public static navigateToAccount(navigate: Function, currentUrl: string): void {
        NavigationHelper.navigateIfNotOnPage(navigate, CONSTANTS.ACCOUNT_URL, currentUrl);        
    }

    public static navigateToChat(navigate: Function, targetChatThreadId: string, currentlySelectedChatThreadId: string | null, queryParams: URLSearchParams, deviceType: DeviceType): void {
        if (deviceType === DeviceType.MOBILE_PHONE) {
            navigate(`${CONSTANTS.CHAT_URL}/${targetChatThreadId}`);
        } else {
            // if already on the target chat, do nothing
            if (targetChatThreadId !== currentlySelectedChatThreadId) {
                navigate(`${CONSTANTS.HOME_URL}/${targetChatThreadId}?${queryParams.toString()}`);
            }
        }
    }

    private static navigateIfNotOnPage(navigate: Function, targetUrl: string, currentPageUrl: string): void {
        if (currentPageUrl.includes(targetUrl) === true) {
            return;
        }
        
        navigate(targetUrl);
    }
}
