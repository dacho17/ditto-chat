import { useNavigate } from "react-router-dom";
import { IoHomeOutline, IoPersonOutline, IoLogOutOutline } from "react-icons/io5";
import IconButton from "../iconButton/IconButton";
import CONSTANTS from "../../../Constants";
import DittoConsultingLogo from '../../../assets/ditto-consulting-logo.png';
import "./SideMenu.css";

const ICON_SIZE = 30;

export default function SideMenu() {
    const navigate = useNavigate();
    
    const SIDE_MENU_FEATURES_BUTTONS = [
        {
            icon: <IoHomeOutline size={ICON_SIZE} />,
            onClickFunction: () => navigate(CONSTANTS.HOME_URL)
        }
    ];

    const SIDE_MENU_ACCOUNT_BUTTONS = [
        {
            icon: <IoPersonOutline size={ICON_SIZE} />,
            onClickFunction: () => navigate(CONSTANTS.ACCOUNT_URL)
        },
        {
            icon: <IoLogOutOutline size={ICON_SIZE} className="alert" />,
            onClickFunction: () => navigate(CONSTANTS.LOGOUT_URL) // TODO: First Logout, then redirect to login!
        }
    ];

    return <div className="side-menu">
        <div className="side-menu-logo-container panel-header">
            <img className="ditto-logo" src={DittoConsultingLogo} alt={CONSTANTS.APPLICATION_NAME}/>
        </div>
        <div className="side-menu-options">
            <div className="side-menu-features">
                <div className="margin-bottom-2" />
                {SIDE_MENU_FEATURES_BUTTONS.map((featureButton => {
                    return <div className="margin-bottom-2">
                        <IconButton
                            icon={featureButton.icon}
                            onClick={featureButton.onClickFunction}
                        />
                    </div>
                }))}
            </div>
            <div className="side-menu-account">
                <div className="margin-bottom-2" />
                {SIDE_MENU_ACCOUNT_BUTTONS.map((accountButton => {
                    return <div className="margin-bottom-2">
                        <IconButton
                            icon={accountButton.icon}
                            onClick={accountButton.onClickFunction}
                        />
                    </div>
                }))}
            </div>
        </div>
	</div>
}
