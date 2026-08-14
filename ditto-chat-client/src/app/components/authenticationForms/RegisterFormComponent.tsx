import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../store/ReduxStore";
import { register, setIsCurrentlyAuthenticating } from "../../store/AuthSlice";
import useTryToSendRequest from "../../hooks/UseTryToSendRequest";
import AuthenticationForm from "../authenticationForm/AuthenticationForm";
import GenFormInput, { GenFormInputState, INITIAL_GEN_FORM_INPUT_STATE } from "../genFormInput/GenFormInput";
import CtaButton from "../ctaButton/CtaButton";
import Validator from "../../helpers/Validator";
import ChatterRegistrationForm from "../../classes/ChatterRegistrationForm";
import CONSTANTS from "../../../Constants";

const REGISTER_FORM_TITLE = "Register Chat Account";
const LOGIN_PAGE_HIPERLINK_TEXT = "Log in";
const ALREADY_HAVE_ACCOUNT_TEXT = "Already have an account?";

export default function RegisterFormComponent() {
    const { isCurrentlyAuthenticating } = useAppSelector(state => state.authSlice);
    const dispatch = useAppDispatch();
    const [sendTryToRegister, _] = useTryToSendRequest<{ redirectUrl: string }>();

    const [chatterName, setChatterName] = useState<GenFormInputState>(INITIAL_GEN_FORM_INPUT_STATE);
    const [chatterSurname, setChatterSurname] = useState<GenFormInputState>(INITIAL_GEN_FORM_INPUT_STATE);
    const [chatterUsername, setChatterUsername] = useState<GenFormInputState>(INITIAL_GEN_FORM_INPUT_STATE);
    const [chatterEmail, setChatterEmail] = useState<GenFormInputState>(INITIAL_GEN_FORM_INPUT_STATE);
    const [chatterPassword, setChatterPassword] = useState<GenFormInputState>(INITIAL_GEN_FORM_INPUT_STATE);

    function isRegisterFormInputValid(): boolean {
        return Validator.validateChatterName(chatterName.entered)
            && Validator.validateChatterName(chatterSurname.entered)
            && Validator.validateChatterUsername(chatterUsername.entered)
            && Validator.validateEmail(chatterEmail.entered)
            && Validator.validatePassword(chatterPassword.entered);
    }

    function resetRegisterFormInputs(): void {
        setChatterName(INITIAL_GEN_FORM_INPUT_STATE);
        setChatterSurname(INITIAL_GEN_FORM_INPUT_STATE);
        setChatterUsername(INITIAL_GEN_FORM_INPUT_STATE);
        setChatterEmail(INITIAL_GEN_FORM_INPUT_STATE);
        setChatterPassword(INITIAL_GEN_FORM_INPUT_STATE);
    }

    async function tryToRegister(): Promise<void> {
        if (isRegisterFormInputValid() === false) {
            toast.error(CONSTANTS.INVALID_FORM_CLIENT_MESSAGE);
            return;
        }

        const registrationFormToSend = new ChatterRegistrationForm(
            chatterName.entered, chatterSurname.entered, chatterUsername.entered,
            chatterEmail.entered, chatterPassword.entered
        );

        await sendTryToRegister(async () => {
            dispatch(setIsCurrentlyAuthenticating(true));
            const responseBody = await dispatch(register({ registrationForm: registrationFormToSend })).unwrap();

            resetRegisterFormInputs();
            return responseBody;
        }, () => {
            dispatch(setIsCurrentlyAuthenticating(false));
        });
    }
    
    function getRegisterFormInputGroups(): React.JSX.Element {
        return <>
            <div className="authentication-form-input-group">
                <div className="authentication-form-input-item half-row-input-item left-item">
                    <GenFormInput
                        name={"name"}
                        placeholder="Your Name"
                        inputState={chatterName}
                        setInputStateFn={setChatterName}
                        inputType="text"
                        isDisabled={isCurrentlyAuthenticating}
                        validationFn={Validator.validateChatterName}
                        errMsg={CONSTANTS.INVALID_NAME_INPUT_CLIENT_MESSAGE}
                    />
                </div>
                <div className="authentication-form-input-item half-row-input-item right-item">
                    <GenFormInput
                        name={"surname"}
                        placeholder="Your Surname"
                        inputState={chatterSurname}
                        setInputStateFn={setChatterSurname}
                        inputType="text"
                        isDisabled={isCurrentlyAuthenticating}
                        validationFn={Validator.validateChatterName}
                        errMsg={CONSTANTS.INVALID_SURNAME_INPUT_CLIENT_MESSAGE}
                    />
                </div>
            </div>
            <div className="authentication-form-input-group">
                <div className="authentication-form-input-item half-row-input-item left-item">
                    <GenFormInput
                        name={"username"}
                        placeholder="Your Username"
                        inputState={chatterUsername}
                        setInputStateFn={setChatterUsername}
                        inputType="text"
                        isDisabled={isCurrentlyAuthenticating}
                        validationFn={Validator.validateChatterUsername}
                        errMsg={CONSTANTS.INVALID_USERNAME_INPUT_CLIENT_MESSAGE}
                    />
                </div>
            </div>
            <div className="authentication-form-input-group">
                <div className="authentication-form-input-item half-row-input-item left-item">
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
                <div className="authentication-form-input-item half-row-input-item right-item">
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

    function getSubmitRegisterFormButton(): React.JSX.Element {
        return <CtaButton
            label={CONSTANTS.CTA_BUTTON_REGISTER_LABEL}
            actionFn={() => tryToRegister()}
            isDisabled={isRegisterFormInputValid() === false || isCurrentlyAuthenticating}
        />
    }

    function getRegisterFormLinks(): React.JSX.Element {
        return <>
            <div className="regular-faded-text">
                {ALREADY_HAVE_ACCOUNT_TEXT}<Link className="authentication-form-link margin-left-1" to={CONSTANTS.LOGIN_URL}>{LOGIN_PAGE_HIPERLINK_TEXT}</Link>
            </div>
        </>
    }

    return <AuthenticationForm
        formTitle={REGISTER_FORM_TITLE}
        inputGroups={getRegisterFormInputGroups()}
        submitFormButton={getSubmitRegisterFormButton()}
        formLinks={getRegisterFormLinks()}
    />
}
