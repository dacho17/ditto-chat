import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/ReduxStore";
import { clearAuthState } from "../store/AuthSlice";
import TimeHelper from "../helpers/TimeHelper";
import CONSTANTS from "../../Constants";


const PUBLIC_PAGES_URLS = [
    CONSTANTS.REGISTER_URL,
    CONSTANTS.LOGIN_URL,
    CONSTANTS.FORGOT_PASSWORD_URL,
    CONSTANTS.RESET_PASSWORD_URL
];

export default function useIsAuthenticated(): void {
    const { chatterOverview, sessionExpiresAtTimestamp } = useAppSelector(state => state.authSlice);
    const dispatch = useAppDispatch();
	const location = useLocation();
    const navigate = useNavigate();
    
    const isOnPublicPage = PUBLIC_PAGES_URLS.find(pageUrl => location.pathname.includes(pageUrl)) !== undefined;
    const didSessionExpire = sessionExpiresAtTimestamp !== null && sessionExpiresAtTimestamp < TimeHelper.getCurrentTimestamp();
    useEffect(() => {
        if (isOnPublicPage === false && (chatterOverview === null || didSessionExpire === true)) {
            dispatch(clearAuthState());
            navigate(CONSTANTS.LOGIN_URL);
            return;
        }
    }, [location.pathname]);
}
