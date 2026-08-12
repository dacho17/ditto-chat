import DittoConsultingLogo from '../../../assets/ditto-consulting-logo.png';
import CONSTANTS from '../../../Constants';
import "./DittoLogoAndTitle.css";

export default function DittoLogoAndTitle() {
    return <>
        <div className="ditto-logo-container">
            <img className="ditto-logo" src={DittoConsultingLogo} alt={CONSTANTS.APPLICATION_NAME}/>
        </div>
        <div className="ditto-chat-title">
            {CONSTANTS.APPLICATION_NAME}
        </div>
    </>
}
