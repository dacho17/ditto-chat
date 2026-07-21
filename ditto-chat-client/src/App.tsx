import {  Navigate, Route, Routes } from 'react-router-dom';
import AuthenticationPage from './app/pages/authenticationPage/AuthenticationPage';
import HomePage from './app/pages/homePage/HomePage';
import MobileChatPage from './app/pages/mobileChatPage/MobileChatPage';
import AccountPage from './app/pages/accountPage/AccountPage';
import ChattersPage from './app/pages/chattersPage/ChattersPage';
import ChatterPage from './app/pages/chatterPage/ChatterPage';
import CONSTANTS from './Constants';
import './App.css';

export default function App() {
    return (
        <>
            <Routes>
                <Route path={CONSTANTS.ROOT_URL} element={<Navigate to={CONSTANTS.HOME_URL} replace />} />
                <Route path={CONSTANTS.REGISTER_URL} element={<AuthenticationPage />} />
                <Route path={CONSTANTS.LOGIN_URL} element={<AuthenticationPage />} />
                <Route path={CONSTANTS.HOME_URL} element={<HomePage />} />
                <Route path={CONSTANTS.CHAT_URL} element={<MobileChatPage />} />
                <Route path={CONSTANTS.ACCOUNT_URL} element={<AccountPage />} />
                <Route path={CONSTANTS.CHATTERS_URL} element={<ChattersPage />} />
                <Route path={CONSTANTS.CHATTER_URL} element={<ChatterPage />} />
            </Routes>
        </>
    );
}
