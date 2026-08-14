import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AsyncThunkRejectType } from "../store/ReduxStore";

export default function useTryToSendRequest<R>(): [
    (tryToSendRequestFunction: () => Promise<R>, finallyFunction: () => void) => Promise<R | null>,
    boolean
] {
    const [didUnhandledServerErrorOccur, setDidUnhandledServerErrorOccur] = useState(false);
    const navigate = useNavigate();

    async function tryToSendRequest(tryToSendRequestFunction: <_>() => Promise<R | { redirectUrl: string }>, finallyFunction: () => void): Promise<R | null> {
        let navigateToUrl = null;
        let result = null;

        try {
            const responseBody = await tryToSendRequestFunction<R>();
            if (responseBody !== undefined && responseBody !== null && responseBody.redirectUrl !== null && responseBody.redirectUrl !== undefined) {
                navigateToUrl = responseBody.redirectUrl;
            } else if (responseBody !== undefined && responseBody !== null) {
                result = responseBody;
            }
        } catch (err: any) {
            const { redirectUrl } = err as AsyncThunkRejectType;
            if (redirectUrl !== null) {
                navigateToUrl = redirectUrl;
            } else {
                setDidUnhandledServerErrorOccur(true);
            }
        } finally {
            finallyFunction();
        }

        if (navigateToUrl !== null) {
            navigate(navigateToUrl);
            return null;
        } else {
            return result;
        }
    }

    return [tryToSendRequest, didUnhandledServerErrorOccur];
}
