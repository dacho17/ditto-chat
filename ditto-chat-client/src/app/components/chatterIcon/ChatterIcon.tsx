import "./ChatterIcon.css";

interface Props {
    chatterFullName: string;
    chatterImageUrl: string | null;
    isOnline: boolean;
    isShownAsAccountImage: boolean;
}

export default function ChatterIcon(props: Props) {
    const ACCOUNT_IMAGE_STYLE = props.isShownAsAccountImage ? "account-image" : "";

    function getChatterIconImage(): React.JSX.Element {
        if (props.chatterImageUrl !== null) {
            return <img className={`chatter-icon-image ${ACCOUNT_IMAGE_STYLE}`} src={props.chatterImageUrl} alt={props.chatterFullName} />
        } else {
            return <div className={`chatter-icon-image default-image ${ACCOUNT_IMAGE_STYLE}`}>
                {props.chatterFullName[0].toUpperCase()}
            </div>
        }
    }

    const ONLINE_STATUS_INDICATOR_STYLE = props.isOnline ? "online" : "offline";
    return <div className={`chatter-icon ${ACCOUNT_IMAGE_STYLE}`}>
        {getChatterIconImage()}
        <div className="online-status-indicator-background" />
        <div className={`online-status-indicator ${ONLINE_STATUS_INDICATOR_STYLE}`} />
    </div>
}
