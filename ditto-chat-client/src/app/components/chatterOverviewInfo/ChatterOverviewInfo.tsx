import ChatterOverview from "../../interfaces/ChatterOverview";
import ChatterIcon from "../chatterIcon/ChatterIcon";
import ChatterIconImage from '../../../assets/david-chat-image.jpg';
import "./ChatterOverviewInfo.css";

const DUMMY_ACCOUNT: ChatterOverview = {
    chatterName: "David Dosenovic",
    chatterImageUrl: ChatterIconImage,
    isChatterOnline: true
};

export default function ChatterOverviewInfo() {
    function getOnlineText() {
        if (DUMMY_ACCOUNT.isChatterOnline === true) {
            return <>
                <div className="online-indicator online" />
                <div className="margin-right-1" />
                <span className="regular-faded-text line-height-2">{"Online"}</span>
            </>
        } else {
            return <>
                <div className="online-indicator offline" />
                <div className="margin-right-1" />
                <span className="regular-faded-text line-height-2">{"Offline"}</span>
            </>
        }
    }

    return <div className="chatter-overview-info">
        <div className="chatter-overview-info-chatter-icon-container">
            <ChatterIcon
                chatterName={DUMMY_ACCOUNT.chatterName}
                chatterImageUrl={DUMMY_ACCOUNT.chatterImageUrl}
                isOnline={DUMMY_ACCOUNT.isChatterOnline}
            />
        </div>
        <div className="chatter-overview-info-chatter-summary">
            <span className="bold-text handle-overflow">{DUMMY_ACCOUNT.chatterName}</span>
            <div className="chatter-overview-info-chatter-online-status">{getOnlineText()}</div>
        </div>
    </div>
}
