import { useNavigate } from "react-router-dom";
import ChatWindow from "../../components/chatWindow/ChatWindow";
import CONSTANTS from "../../../Constants";
import "./MobileChatPage.css";

export default function MobileChatPage() {
    const navigate = useNavigate();
    
    if (false) {    // TODO: if screen size is not mobile screen size
        navigate(CONSTANTS.HOME_URL);
    }

    return <div className="mobile-chat-page full-screen-height">
        <ChatWindow />
    </div>
}
