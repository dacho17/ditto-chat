import { useNavigate } from "react-router-dom";
import { IoChatbubbleOutline } from "react-icons/io5";
import { useAppDispatch } from "../../store/ReduxStore";
import { clearHomeState } from "../../store/HomeSlice";
import CONSTANTS from "../../../Constants";
import "./NewChatButton.css";

export default function NewChatButton() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    return <button
        className="new-chat-button"
        onClick={() => {
            dispatch(clearHomeState());
            navigate(`${CONSTANTS.CHATTERS_URL}`)}
        }
    >
        <IoChatbubbleOutline size={CONSTANTS.ICON_SIZE} />
    </button>
}
