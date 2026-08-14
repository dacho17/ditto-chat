import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { login, setIsCurrentlyAuthenticating } from "../../store/AuthSlice";
import useTryToSendRequest from "../../hooks/UseTryToSendRequest";
import AuthenticationForm from "../authenticationForm/AuthenticationForm";
import GenFormInput, { GenFormInputState, INITIAL_GEN_FORM_INPUT_STATE } from "../genFormInput/GenFormInput";
import CtaButton from "../ctaButton/CtaButton";
import Validator from "../../helpers/Validator";
import LoginForm from "../../classes/LoginForm";
import CONSTANTS from "../../../Constants";

const LOGIN_FORM_TITLE = "Login to Ditto Chat";
const FORGOT_PASSWORD_HIPERLINK_TEXT = "Forgot Password?";
const REGISTER_PAGE_HIPERLINK_TEXT = "Register";
const DONT_HAVE_ACCOUNT_TEXT = "Don't have an account?";

export default function LoginFormComponent() {
    const { isCurrentlyAuthenticating } = useAppSelector(state => state.authSlice);
    const dispatch = useAppDispatch();
    const [sendTryToLogin, _] = useTryToSendRequest<{ redirectUrl: string }>();

    const [chatterEmail, setChatterEmail] = useState<GenFormInputState>(INITIAL_GEN_FORM_INPUT_STATE);
    const [chatterPassword, setChatterPassword] = useState<GenFormInputState>(INITIAL_GEN_FORM_INPUT_STATE);

    function isLoginFormInputValid(): boolean {
        return Validator.validateChatterName(chatterEmail.entered)
            && Validator.validatePassword(chatterPassword.entered);
    }

    function resetLoginFormInputs(): void {
        setChatterEmail(INITIAL_GEN_FORM_INPUT_STATE);
        setChatterPassword(INITIAL_GEN_FORM_INPUT_STATE);
    }

    async function tryToLogin(): Promise<void> {
        if (isLoginFormInputValid() === false) {
            toast.error(CONSTANTS.INVALID_FORM_CLIENT_MESSAGE);
            return;
        }

        const loginFormToSend = new LoginForm(chatterEmail.entered, chatterPassword.entered);

        await sendTryToLogin(async () => {
            dispatch(setIsCurrentlyAuthenticating(true));
            const responseBody = await dispatch(login({ loginForm: loginFormToSend })).unwrap();

            resetLoginFormInputs();
            return responseBody;
        }, () => {
            dispatch(setIsCurrentlyAuthenticating(false));
        });
    }

    function getLoginFormInputGroups(): React.JSX.Element {
        return <>
            <div className="authentication-form-input-group">
                <div className="authentication-form-input-item full-row-input-item">
                    <GenFormInput
                        name={"email"}
                        placeholder="Your Email"
                        inputState={chatterEmail}
                        setInputStateFn={setChatterEmail}
                        inputType="email"
                        isDisabled={isCurrentlyAuthenticating}
                        validationFn={Validator.validateEmail}
                        errMsg={CONSTANTS.INVALID_EMAIL_INPUT_CLIENT_MESSAGE}
                    />
                </div>
            </div>
            <div className="authentication-form-input-group">
                <div className="authentication-form-input-item full-row-input-item">
                    <GenFormInput
                        name={"password"}
                        placeholder="Your Password"
                        inputState={chatterPassword}
                        setInputStateFn={setChatterPassword}
                        inputType="password"
                        isDisabled={isCurrentlyAuthenticating}
                        validationFn={Validator.validatePassword}
                        errMsg={CONSTANTS.INVALID_PASSWORD_INPUT_CLIENT_MESSAGE}
                    />
                </div>
            </div>
        </>
    }

    function getSubmitLoginFormButton(): React.JSX.Element {
        return <CtaButton
            label={CONSTANTS.CTA_BUTTON_LOGIN_LABEL}
            actionFn={() => tryToLogin()}
            isDisabled={isLoginFormInputValid() === false || isCurrentlyAuthenticating}
        />
    }

    function getLoginFormLinks(): React.JSX.Element {
        return <>
            <Link className="authentication-form-link margin-bottom-2" to={CONSTANTS.FORGOT_PASSWORD_URL}>{FORGOT_PASSWORD_HIPERLINK_TEXT}</Link>
            <div className="regular-faded-text">
                {DONT_HAVE_ACCOUNT_TEXT}<Link className="authentication-form-link margin-left-1" to={CONSTANTS.REGISTER_URL}>{REGISTER_PAGE_HIPERLINK_TEXT}</Link>
            </div>
        </>
    }

    return <AuthenticationForm
        formTitle={LOGIN_FORM_TITLE}
        inputGroups={getLoginFormInputGroups()}
        submitFormButton={getSubmitLoginFormButton()}
        formLinks={getLoginFormLinks()}
    />
}
