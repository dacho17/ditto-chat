import { useLocation, useNavigate } from "react-router-dom";
import { IoHomeOutline, IoPersonOutline, IoLogOutOutline } from "react-icons/io5";
import { useAppDispatch } from "../../store/ReduxStore";
import useTryToSendRequest from "../../hooks/UseTryToSendRequest";
import IconButton from "../iconButton/IconButton";
import SliceHelper from "../../helpers/SliceHelper";
import NavigationHelper from "../../helpers/NavigationHelper";
import CONSTANTS from "../../../Constants";
import DittoConsultingLogo from '../../../assets/ditto-consulting-logo.png';
import "./SideMenu.css";

type SideMenuButtonProps = { icon: React.JSX.Element, onClickFunction: () => void };
export default function SideMenu() {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const [sendTryToLogout, __] = useTryToSendRequest<null>();
    const navigate = useNavigate();

    function getSideMenuFeaturesButtonsProps(): SideMenuButtonProps[] {
        return [
            {
                icon: <IoHomeOutline size={CONSTANTS.LARGER_ICON_SIZE} />,
                onClickFunction: () => {
                    NavigationHelper.navigateToInitialHome(navigate, location.pathname);
                }
            }
        ];
    }

    function getSideMenuAccountButtonsProps(): SideMenuButtonProps[] {
        return [
            {
                icon: <IoPersonOutline size={CONSTANTS.LARGER_ICON_SIZE} />,
                onClickFunction: () => {
                    NavigationHelper.navigateToAccount(navigate, location.pathname);
                }
            },
            {
                icon: <IoLogOutOutline size={CONSTANTS.LARGER_ICON_SIZE} className="alert" />,
                onClickFunction: async () => {
                    SliceHelper.tryToLogout(sendTryToLogout, dispatch);
                }
            }
        ];
    }

    function getSideMenuButton(buttonProps: SideMenuButtonProps, buttonKey: string): React.JSX.Element {
        return <div
            key={`margin-${buttonKey}`}
            className="margin-bottom-2"
        >
            <IconButton
                key={`${buttonKey}`}
                icon={buttonProps.icon}
                onClick={buttonProps.onClickFunction}
            />
        </div>
    }

    return <div className="side-menu">
        <div className="side-menu-logo-container panel-header">
            <img className="ditto-logo" src={DittoConsultingLogo} alt={CONSTANTS.APPLICATION_NAME}/>
        </div>
        <div className="side-menu-options">
            <div className="side-menu-features">
                <div className="margin-bottom-2" />
                {getSideMenuFeaturesButtonsProps().map(((featureButtonProps, index) => {
                    return getSideMenuButton(featureButtonProps, `feature-button-id-${index}`);
                }))}
            </div>
            <div className="side-menu-account">
                <div className="margin-bottom-2" />
                {getSideMenuAccountButtonsProps().map(((accountButtonProps, index) => {
                    return getSideMenuButton(accountButtonProps, `account-button-id-${index}`);
                }))}
            </div>
        </div>
	</div>
}
