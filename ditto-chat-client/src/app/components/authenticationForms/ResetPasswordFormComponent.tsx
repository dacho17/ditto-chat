import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { resetPassword, setIsCurrentlyAuthenticating } from "../../store/AuthSlice";
import AuthenticationForm from "../authenticationForm/AuthenticationForm";
import GenFormInput, { GenFormInputState, INITIAL_GEN_FORM_INPUT_STATE } from "../genFormInput/GenFormInput";
import CtaButton from "../ctaButton/CtaButton";
import Validator from "../../helpers/Validator";
import ResetPasswordForm from "../../classes/ResetPasswordForm";
import CONSTANTS from "../../../Constants";

const RESET_PASSWORD_FORM_TITLE = "Reset Your Password";
const LOGIN_PAGE_HIPERLINK_TEXT = "Log in";
const BACK_TO_TEXT = "Back to";

export default function ResetPasswordFormComponent() {
    const { isCurrentlyAuthenticating } = useAppSelector(state => state.authSlice);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [searchParams, _] = useSearchParams();
    const passwordResetToken = searchParams.get(CONSTANTS.PASSWORD_RESET_TOKEN_QUERY_PARAMETER);

    const [chatterPassword, setChatterPassword] = useState<GenFormInputState>(INITIAL_GEN_FORM_INPUT_STATE);
    const [chatterRepeatedPassword, setChatterRepeatedPassword] = useState<GenFormInputState>(INITIAL_GEN_FORM_INPUT_STATE);

    function doInputPasswordsMatch(password: string, repeatedPassword: string): boolean {
        return password === repeatedPassword;
    }

    function getRepeatedPasswordErrorMessage(): string | null{
        if (Validator.validatePassword(chatterRepeatedPassword.entered) === false) {
            return CONSTANTS.INVALID_PASSWORD_INPUT_CLIENT_MESSAGE;
        } else if (doInputPasswordsMatch(chatterPassword.entered, chatterRepeatedPassword.entered) === false) {
            return CONSTANTS.INVALID_REPEATED_PASSWORD_INPUT_CLIENT_MESSAGE; 
        } else {
            return null;
        }
    }

    function isResetPasswordFormInputValid(): boolean {
        return Validator.validatePassword(chatterPassword.entered)
            && Validator.validatePassword(chatterRepeatedPassword.entered)
            && doInputPasswordsMatch(chatterPassword.entered, chatterRepeatedPassword.entered);
    }

    function resetResetPasswordFormInputs(): void {
        setChatterPassword(INITIAL_GEN_FORM_INPUT_STATE);
        setChatterRepeatedPassword(INITIAL_GEN_FORM_INPUT_STATE);
    }

    async function tryToSubmitResetPassword(): Promise<void> {
        if (passwordResetToken === null) {
            console.log(`TODO-toasting Show Error!`);
            return;
        }
        
        if (isResetPasswordFormInputValid() === false) {
            console.log(`TODO-toasting Show Error!`);
            return;
        }

        const resetPasswordFormToSend = new ResetPasswordForm(chatterPassword.entered, chatterRepeatedPassword.entered);

        dispatch(setIsCurrentlyAuthenticating(true));

        let responseBody = null;
        try {
            responseBody = await dispatch(resetPassword({ passwordResetToken: passwordResetToken, resetPasswordForm: resetPasswordFormToSend })).unwrap();

            console.log(`TODO-toasting: Toast to success!`);
            resetResetPasswordFormInputs();
        } catch (err: any) {
            console.log(`TODO-toasting: Toast error!`);
        } finally {
            dispatch(setIsCurrentlyAuthenticating(false));
            navigate(responseBody.redirectUrl);
        }
    }

    function getResetPasswordFormInputGroups(): React.JSX.Element {
        return <>
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
            <div className="authentication-form-input-group">
                <div className="authentication-form-input-item full-row-input-item">
                    <GenFormInput
                        name={"repeated-password"}
                        placeholder="Repeat Password"
                        inputState={chatterRepeatedPassword}
                        setInputStateFn={setChatterRepeatedPassword}
                        inputType="password"
                        isDisabled={isCurrentlyAuthenticating}
                        validationFn={(inputRepeatedPassword: string) =>
                            Validator.validatePassword(inputRepeatedPassword) && doInputPasswordsMatch(chatterPassword.entered, inputRepeatedPassword)
                        }
                        errMsg={getRepeatedPasswordErrorMessage()}
                    />
                </div>
            </div>
        </>
    }

    function getSubmitResetPasswordFormButton(): React.JSX.Element {
        return <CtaButton
            label={CONSTANTS.CTA_BUTTON_SUBMIT_LABEL}
            actionFn={() => tryToSubmitResetPassword()}
            isDisabled={isResetPasswordFormInputValid() === false || isCurrentlyAuthenticating}
        />
    }

    function getResetPasswordFormLinks(): React.JSX.Element {
        return <>
            <div className="regular-faded-text">
                {BACK_TO_TEXT}<Link className="authentication-form-link margin-left-1" to={CONSTANTS.LOGIN_URL}>{LOGIN_PAGE_HIPERLINK_TEXT}</Link>
            </div>
        </>
    }

    return <AuthenticationForm
        formTitle={RESET_PASSWORD_FORM_TITLE}
        inputGroups={getResetPasswordFormInputGroups()}
        submitFormButton={getSubmitResetPasswordFormButton()}
        formLinks={getResetPasswordFormLinks()}
    />
}
