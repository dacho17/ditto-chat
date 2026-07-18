import {  Navigate, Route, Routes } from 'react-router-dom';
import AuthenticationPage from './app/pages/authenticationPage/AuthenticationPage';
import HomePage from './app/pages/homePage/HomePage';
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
            </Routes>
        </>
    );
}
