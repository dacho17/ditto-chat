import ChatterIcon from "../chatterIcon/ChatterIcon";
import ChatterOverview from "../../classes/ChatterOverview";
import "./ChatterOverviewInfo.css";

interface Props {
    chatterOverview: ChatterOverview;
}

export default function ChatterOverviewInfo(props: Props) {
    
    const onlineStyle = props.chatterOverview.getIsChatterOnline() === true
        ? "online" : "offline";
    return <div className="chatter-overview-info">
        <div className="chatter-overview-info-chatter-icon-container">
            <ChatterIcon
                chatterFullName={props.chatterOverview.getChatterFullName()}
                chatterImageUrl={props.chatterOverview.getChatterImageUrl()}
                isOnline={props.chatterOverview.getIsChatterOnline()}
            />
        </div>
        <div className="chatter-overview-info-chatter-summary">
            <span className="bold-text handle-overflow">{props.chatterOverview.getChatterFullName()}</span>
            <div className="chatter-overview-info-chatter-online-status">
                <div className={`online-indicator margin-right-1 ${onlineStyle}`} />
                <span className="regular-faded-text line-height-2">{onlineStyle}</span>
            </div>
        </div>
    </div>
}
