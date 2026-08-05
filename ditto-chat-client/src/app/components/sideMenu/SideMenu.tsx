import { useLocation, useNavigate } from "react-router-dom";
import { IoHomeOutline, IoPersonOutline, IoLogOutOutline } from "react-icons/io5";
import { useAppDispatch } from "../../store/ReduxStore";
import IconButton from "../iconButton/IconButton";
import SliceHelper from "../../helpers/SliceHelper";
import NavigationHelper from "../../helpers/NavigationHelper";
import CONSTANTS from "../../../Constants";
import DittoConsultingLogo from '../../../assets/ditto-consulting-logo.png';
import "./SideMenu.css";

export default function SideMenu() {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    const SIDE_MENU_FEATURES_BUTTONS = [
        {
            icon: <IoHomeOutline size={CONSTANTS.LARGER_ICON_SIZE} />,
            onClickFunction: () => {
                NavigationHelper.navigateToInitialHome(navigate, location.pathname);
            }
        }
    ];

    const SIDE_MENU_ACCOUNT_BUTTONS = [
        {
            icon: <IoPersonOutline size={CONSTANTS.LARGER_ICON_SIZE} />,
            onClickFunction: () => {
                NavigationHelper.navigateToAccount(navigate, location.pathname);
            }
        },
        {
            icon: <IoLogOutOutline size={CONSTANTS.LARGER_ICON_SIZE} className="alert" />,
            onClickFunction: async () => {
                const redirectUrl = await SliceHelper.tryLogout(dispatch);
                navigate(redirectUrl);
            }
        }
    ];

    return <div className="side-menu">
        <div className="side-menu-logo-container panel-header">
            <img className="ditto-logo" src={DittoConsultingLogo} alt={CONSTANTS.APPLICATION_NAME}/>
        </div>
        <div className="side-menu-options">
            <div className="side-menu-features">
                <div className="margin-bottom-2" />
                {SIDE_MENU_FEATURES_BUTTONS.map(((featureButton, index) => {
                    return <div
                        key={`margin-feature-button-id-${index}`}
                        className="margin-bottom-2"
                    >
                        <IconButton
                            key={`feature-button-id-${index}`}
                            icon={featureButton.icon}
                            onClick={featureButton.onClickFunction}
                        />
                    </div>
                }))}
            </div>
            <div className="side-menu-account">
                <div className="margin-bottom-2" />
                {SIDE_MENU_ACCOUNT_BUTTONS.map(((accountButton, index) => {
                    return <div
                        key={`margin-account-button-id-${index}`}
                        className="margin-bottom-2"
                    >
                        <IconButton
                            key={`account-button-id-${index}`}
                            icon={accountButton.icon}
                            onClick={accountButton.onClickFunction}
                        />
                    </div>
                }))}
            </div>
        </div>
	</div>
}
