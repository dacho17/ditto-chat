import { useNavigate } from "react-router-dom";
import { TbFaceIdError } from "react-icons/tb";
import CtaButton from "../ctaButton/CtaButton";
import CONSTANTS from "../../../Constants";
import "./ServerResponseErrorCard.css";

interface Props {
    errorMessage?: string;
}

const ERROR_ICON_SIZE = 100;
export default function ServerResponseErrorCard(props: Props) {
    const navigate = useNavigate();

    function getErrorMessage(): string {
        if (props.errorMessage !== null && props.errorMessage !== undefined) {
            return props.errorMessage;
        } else {
            return CONSTANTS.UNEXPECTED_ERROR_CLIENT_MESSAGE;
        }
    }

    return <div className="server-response-error-card">
        <div className="server-response-error-card-content">
            <div className="server-response-error-card-icon-container">
                <TbFaceIdError size={ERROR_ICON_SIZE} className="server-response-error-card-icon"/>
            </div>
            <div className="server-response-error-card-text-container">
                <div className="bold-text">
                    {getErrorMessage()}
                </div>
            </div>
            <div className="server-response-error-card-go-back-container">
                <div className="server-response-error-card-go-back-button-container">
                    <CtaButton 
                        label={CONSTANTS.CTA_BUTTON_BACK_HOME_LABEL}
                        actionFn={() => navigate(CONSTANTS.HOME_URL)}
                        isDisabled={false}
                    />
                </div>
            </div>
        </div>
    </div>
}
