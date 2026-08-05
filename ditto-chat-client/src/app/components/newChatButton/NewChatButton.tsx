import { useNavigate } from "react-router-dom";
import { IoChatbubbleOutline } from "react-icons/io5";
import CONSTANTS from "../../../Constants";
import "./NewChatButton.css";

export default function NewChatButton() {
    const navigate = useNavigate();

    return <button
        className="new-chat-button"
        onClick={() => {
            navigate(`${CONSTANTS.CHATTERS_URL}`)}
        }
    >
        <IoChatbubbleOutline size={CONSTANTS.ICON_SIZE} />
    </button>
}
