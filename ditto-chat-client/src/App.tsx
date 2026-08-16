import { useEffect } from 'react';
import {  Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from "react-hot-toast";  // Following Documentation at: https://react-hot-toast.com/docs/toaster
import { useAppDispatch } from './app/store/ReduxStore';
import { setCurrentDeviceType } from './app/store/DeviceTypeSlice';
import useIsAuthenticated from './app/hooks/UseIsAuthenticated';
import AuthenticationPage from './app/pages/authenticationPage/AuthenticationPage';
import HomePage from './app/pages/homePage/HomePage';
import MobileChatPage from './app/pages/mobileChatPage/MobileChatPage';
import AccountPage from './app/pages/accountPage/AccountPage';
import ChattersPage from './app/pages/chattersPage/ChattersPage';
import ChatterPage from './app/pages/chatterPage/ChatterPage';
import DeviceScreenHelper from './app/helpers/DeviceScreenHelper';
import { AuthenticationActionType } from './app/enums/AuthenticationActionType';
import CONSTANTS from './Constants';
import './App.css';

export default function App() {
    useIsAuthenticated();
    const dispatch = useAppDispatch();
    
    function setDeviceTypeOnScreenResize(): void {
        const currentDeviceType = DeviceScreenHelper.getDeviceType();

        dispatch(setCurrentDeviceType(currentDeviceType));
    }

    useEffect(() => {
        window.addEventListener("resize", setDeviceTypeOnScreenResize);
        return () => window.removeEventListener("resize", setDeviceTypeOnScreenResize);
    }, []);
    
    return (
        <>
            <Toaster position="top-center" toastOptions={{
                duration: CONSTANTS.TOAST_MESSAGE_DISPLAY_DURATION_IN_MS,
                removeDelay: CONSTANTS.TOAST_MESSAGE_REMOVAL_DELAY_IN_MS,
            }}/>
            <Routes>
                <Route path={CONSTANTS.ROOT_URL} element={<Navigate to={CONSTANTS.REGISTER_URL} replace />} />
                
                <Route path={CONSTANTS.REGISTER_URL} element={<AuthenticationPage authenticationActionType={AuthenticationActionType.REGISTER} />} />
                <Route path={CONSTANTS.LOGIN_URL} element={<AuthenticationPage authenticationActionType={AuthenticationActionType.LOGIN} />} />
                <Route path={CONSTANTS.FORGOT_PASSWORD_URL} element={<AuthenticationPage authenticationActionType={AuthenticationActionType.FORGOT_PASSWORD} />} />
                <Route path={CONSTANTS.RESET_PASSWORD_URL} element={<AuthenticationPage authenticationActionType={AuthenticationActionType.RESET_PASSWORD} />} />
                
                <Route path={CONSTANTS.HOME_URL} element={<HomePage />} />
                <Route path={`${CONSTANTS.HOME_URL}/:chatThreadId`} element={<HomePage />} />
                <Route path={`${CONSTANTS.CHAT_URL}/:chatThreadId`} element={<MobileChatPage />} />
                <Route path={CONSTANTS.ACCOUNT_URL} element={<AccountPage />} />
                <Route path={CONSTANTS.CHATTERS_URL} element={<ChattersPage />} />
                <Route path={`${CONSTANTS.CHATTER_URL}/:chatterId`} element={<ChatterPage />} />
            </Routes>
        </>
    );
}
