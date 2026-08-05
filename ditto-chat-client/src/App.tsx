import { useEffect } from 'react';
import {  Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAppDispatch } from './app/store/ReduxStore';
import { getLatestUrlFromUrlHistory, popUrlFromUrlHistory } from './app/store/UrlHistorySlice';
import AuthenticationPage from './app/pages/authenticationPage/AuthenticationPage';
import HomePage from './app/pages/homePage/HomePage';
import MobileChatPage from './app/pages/mobileChatPage/MobileChatPage';
import AccountPage from './app/pages/accountPage/AccountPage';
import ChattersPage from './app/pages/chattersPage/ChattersPage';
import ChatterPage from './app/pages/chatterPage/ChatterPage';
import CONSTANTS from './Constants';
import './App.css';

export default function App() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    function onWebBrowserBackClick(event: PopStateEvent): void {
        dispatch(popUrlFromUrlHistory());

        const targetUrl = getLatestUrlFromUrlHistory();
        navigate(targetUrl);
    }

    useEffect(() => {
        window.addEventListener("popstate", onWebBrowserBackClick);

        return () => {
            window.removeEventListener("popstate", onWebBrowserBackClick);
        }
    }, []);
    
    return (
        <>
            <Routes>
                <Route path={CONSTANTS.ROOT_URL} element={<Navigate to={CONSTANTS.HOME_URL} replace />} />
                <Route path={CONSTANTS.REGISTER_URL} element={<AuthenticationPage />} />
                <Route path={CONSTANTS.LOGIN_URL} element={<AuthenticationPage />} />
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
