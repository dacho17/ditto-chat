import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { AsyncThunk, AsyncThunkConfig } from "@reduxjs/toolkit";
import { useAppDispatch } from "../../store/ReduxStore";
import { getForgotPasswordPage, getLoginPage, getRegisterPage, getResetPasswordPage } from "../../store/AuthSlice";
import RegisterFormComponent from "../../components/authenticationForms/RegisterFormComponent";
import LoginFormComponent from "../../components/authenticationForms/LoginFormComponent";
import ForgotPasswordFormComponent from "../../components/authenticationForms/ForgotPasswordFormComponent";
import ResetPasswordFormComponent from "../../components/authenticationForms/ResetPasswordFormComponent";
import DittoLogoAndTitle from "../../components/dittoLogoAndTitle/DittoLogoAndTitle";
import CtaButton from "../../components/ctaButton/CtaButton";
import LoadingSpinner from "../../components/loadingSpinner/LoadingSpinner";
import SliceHelper from "../../helpers/SliceHelper";
import { AuthenticationActionType } from "../../enums/AuthenticationActionType";
import CONSTANTS from "../../../Constants";
import "./AuthenticationPage.css";


interface Props {
    authenticationActionType: AuthenticationActionType
}

export default function AuthenticationPage(props: Props) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    
    function getAsyncThunkFunction(): AsyncThunk<{ redirectUrl: string } | null, void, AsyncThunkConfig> {
        switch (props.authenticationActionType) {
            case AuthenticationActionType.REGISTER:
                return getRegisterPage;
            case AuthenticationActionType.LOGIN:
                return getLoginPage;
            case AuthenticationActionType.FORGOT_PASSWORD:
                return getForgotPasswordPage;
            case AuthenticationActionType.RESET_PASSWORD:
                return getResetPasswordPage;
            default:
                throw new Error("Unknown Authentication Action Type Received. This should never occur!");
        }
    }

    async function tryToGetAuthenticationPage(): Promise<void> {
        const getAuthenticationPageFunction = getAsyncThunkFunction();

        let responseBody = null;
        try {
            responseBody = await dispatch(getAuthenticationPageFunction()).unwrap();
        } catch (err) {
            console.log("TODO: handle Error!");
        } finally {
            setIsLoadingPage(false);

            if (responseBody !== null) {
                navigate(responseBody.redirectUrl);
            }
        }
    }

    useEffect(() => {
        SliceHelper.clearPageStates(dispatch);
        tryToGetAuthenticationPage();
    }, []);

    function getAuthenticationPageContent(): React.JSX.Element {
        if (isLoadingPage === true) {
            return <div className="authentication-page-content-loading-spinner-container">
                <LoadingSpinner />
            </div>
        }

        switch (props.authenticationActionType) {
            case AuthenticationActionType.REGISTER:
                return <RegisterFormComponent />;
            case AuthenticationActionType.LOGIN:
                return <LoginFormComponent />;
            case AuthenticationActionType.FORGOT_PASSWORD:
                return <ForgotPasswordFormComponent />;
            case AuthenticationActionType.RESET_PASSWORD:
                return <ResetPasswordFormComponent />;
            default:
                throw new Error("Unknown Authentication Action Type Received. This should never occur!");
        }
    }

    return <div className="authentication-page">
        <div className="authentication-page-header">
            <div className="authentication-page-header-ditto-chat-container">
                <DittoLogoAndTitle />
            </div>
            <div className="authentication-page-header-contact-us-button-container">
                <CtaButton
                    label={CONSTANTS.CTA_BUTTON_CONTACT_US_LABEL}
                    actionFn={() => window.location.href=CONSTANTS.COMPANY_URL}
                    isDisabled={false}
                />
            </div>
        </div>
        <div className="authentication-page-content">
            {getAuthenticationPageContent()}
        </div>
    </div>
}
