import "./ChatterIcon.css";

interface Props {
    chatterImageUrl: string;
    chatterName: string;
    isOnline: boolean;
}

export default function ChatterIcon(props: Props) {
    const ONLINE_STATUS_INDICATOR_STYLE = props.isOnline ? "online" : "offline";

    return <div className="chatter-icon">
        <img className="chatter-icon-image" src={props.chatterImageUrl} alt={props.chatterName} />
        <div className="online-status-indicator-background" />
        <div className={`online-status-indicator ${ONLINE_STATUS_INDICATOR_STYLE}`} />
    </div>
}
