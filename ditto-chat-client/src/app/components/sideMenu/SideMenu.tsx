import { IoNotificationsOutline, IoCalendarNumberOutline, IoSettingsOutline } from "react-icons/io5";
import ChatterIcon from "../chatterIcon/ChatterIcon";
import ChatterOverview from "../../interfaces/ChatterOverview";
import CONSTANTS from "../../../Constants";
import ChatterIconImage from '../../../assets/david-chat-image.jpg';
import DittoConsultingLogo from '../../../assets/ditto-consulting-logo.png';
import "./SideMenu.css";

const ICON_SIZE = 26;
const DUMMY_ACCOUNT: ChatterOverview = {
    chatterName: "David Dosenovic",
    chatterImageUrl: ChatterIconImage,
    isChatterOnline: true
};

const SIDE_MENU_FEATURES = [
    <IoNotificationsOutline size={ICON_SIZE}/>,
    <IoCalendarNumberOutline size={ICON_SIZE}/>
];

export default function SideMenu() {
    return <div className="side-menu">
        <div className="side-menu-logo-container panel-header">
            <img className="ditto-logo" src={DittoConsultingLogo} alt={CONSTANTS.APPLICATION_NAME}/>
        </div>
        <div className="side-menu-options">
            <div className="side-menu-features">
                <div className="margin-bottom-2" />
                {SIDE_MENU_FEATURES.map((featureEl => {
                    return <button className="side-menu-feature-button margin-bottom-2">
                    {featureEl}
                </button>
                }))}
            </div>
            <div className="side-menu-account">
                <button className="side-menu-feature-button margin-bottom-2">
                    <IoSettingsOutline size={ICON_SIZE} />
                </button>
                <div className="side-menu-chatter-icon-container">
                    <ChatterIcon
                        chatterName={DUMMY_ACCOUNT.chatterName}
                        chatterImageUrl={DUMMY_ACCOUNT.chatterImageUrl}
                        isOnline={DUMMY_ACCOUNT.isChatterOnline}
                    />
                </div>
            </div>
        </div>
	</div>
}
