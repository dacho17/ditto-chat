import ChatterIconImage from '../../../assets/david-chat-image.jpg';
import "./AccountDetails.css";

interface Props {
    isDisplayedInPanel: boolean;
}

const DUMMY_NAME = "TODO name";
const DUMMY_USERNNAME = "@todo.username";

// TODO: ChatterDetails are shown (name, onlineStatus, image)
export default function AccountDetails(props: Props) {

    const displayedInPanelStyle = props.isDisplayedInPanel ? "displayed-in-panel" : "";

    // TODO: // Enable selecting and uploading an Image
    return <div className={`account-details ${displayedInPanelStyle}`}>
        <div className="account-details-chatter-image-section">
            <div className="account-details-chatter-image-container">
                <img className="account-details-chatter-image" src={ChatterIconImage} alt={"TODO"} />
            </div>
        </div>
        <div className="account-details-chatter-name-section">
            <div className="account-details-chatter-name margin-bottom-1">
                {DUMMY_NAME}
            </div>
            <div className="account-details-chatter-username">
                {DUMMY_USERNNAME}
            </div>
        </div>
    </div>
}
