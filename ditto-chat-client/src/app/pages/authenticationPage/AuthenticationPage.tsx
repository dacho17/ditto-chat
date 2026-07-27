import { useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/ReduxStore";
import { login, setIsCurrentlyAuthenticating } from "../../store/AuthSlice";
import LoginForm from "../../classes/LoginForm";

const DUMMY_LOGIN_FORM = new LoginForm("dummy@email.hr", "password");

// TODO: This is a Dummy Implementation simulating the Gateway into the State Machine
export default function AuthenticationPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const trySendLoginForm = useCallback(async () => {
        

        dispatch(setIsCurrentlyAuthenticating(true));

        try {
            const { redirectUrl } = await dispatch(login(DUMMY_LOGIN_FORM)).unwrap();
            navigate(redirectUrl);
        } catch (err: any) {
        } finally {
            dispatch(setIsCurrentlyAuthenticating(false));
        }
    }, []);

    useEffect(() => {
        trySendLoginForm();
    }, [trySendLoginForm]);

    return <>
        TODO
    </>
}
