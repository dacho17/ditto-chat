import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { forgotPassword, setIsCurrentlyAuthenticating } from "../../store/AuthSlice";
import AuthenticationForm from "../authenticationForm/AuthenticationForm";
import GenFormInput, { GenFormInputState, INITIAL_GEN_FORM_INPUT_STATE } from "../genFormInput/GenFormInput";
import CtaButton from "../ctaButton/CtaButton";
import Validator from "../../helpers/Validator";
import ForgotPasswordForm from "../../classes/ForgotPasswordForm";
import CONSTANTS from "../../../Constants";

const FORGOT_PASSWORD_FORM_TITLE = "Send Request to Reset Your Password";
const LOGIN_PAGE_HIPERLINK_TEXT = "Log in";
const BACK_TO_TEXT = "Back to";

export default function ForgotPasswordFormComponent() {
    const { isCurrentlyAuthenticating } = useAppSelector(state => state.authSlice);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [chatterEmail, setChatterEmail] = useState<GenFormInputState>(INITIAL_GEN_FORM_INPUT_STATE);

    function isForgotPasswordFormInputValid(): boolean {
        return Validator.validateEmail(chatterEmail.entered);
    }

    function resetForgotPasswordFormInputs(): void {
        setChatterEmail(INITIAL_GEN_FORM_INPUT_STATE);
    }

    async function tryToSubmitForgotPassword(): Promise<void> {
        if (isForgotPasswordFormInputValid() === false) {
            console.log(`TODO-toasting Show Error!`);
            return;
        }

        const forgotPasswordFormToSend = new ForgotPasswordForm(chatterEmail.entered);

        dispatch(setIsCurrentlyAuthenticating(true));

        let responseBody = null;
        try {
            responseBody = await dispatch(forgotPassword({ forgotPasswordForm: forgotPasswordFormToSend })).unwrap();

            console.log(`TODO-toasting: Toast to success!`);
            resetForgotPasswordFormInputs();
        } catch (err: any) {
            console.log(`TODO-toasting: Toast error!`);
        } finally {
            dispatch(setIsCurrentlyAuthenticating(false));
            if (responseBody !== null) {
                navigate(responseBody.redirectUrl);
            }
        }
    }

    function getForgotPasswordFormInputGroups(): React.JSX.Element {
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
        </>
    }

    function getSubmitForgotPasswordFormButton(): React.JSX.Element {
        return <CtaButton
            label={CONSTANTS.CTA_BUTTON_SUBMIT_LABEL}
            actionFn={() => tryToSubmitForgotPassword()}
            isDisabled={isForgotPasswordFormInputValid() === false || isCurrentlyAuthenticating}
        />
    }

    function getForgotPasswordFormLinks(): React.JSX.Element {
        return <>
            <div className="regular-faded-text">
                {BACK_TO_TEXT}<Link className="authentication-form-link margin-left-1" to={CONSTANTS.LOGIN_URL}>{LOGIN_PAGE_HIPERLINK_TEXT}</Link>
            </div>
        </>
    }

    return <AuthenticationForm
        formTitle={FORGOT_PASSWORD_FORM_TITLE}
        inputGroups={getForgotPasswordFormInputGroups()}
        submitFormButton={getSubmitForgotPasswordFormButton()}
        formLinks={getForgotPasswordFormLinks()}
    />
}
