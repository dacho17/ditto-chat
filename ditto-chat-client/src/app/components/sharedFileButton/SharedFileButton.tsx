import { useAppDispatch } from "../../store/ReduxStore";
import { setChatSharedFileInOverlay } from "../../store/ChatSlice";
import { setChatterSharedFileInOverlay } from "../../store/ChatterSlice";
import SharedFile from "../../classes/SharedFile";
import "./SharedFileButton.css";

interface Props {
    sharedFile: SharedFile;
    isShownInChatThreadMessage: boolean
}

export default function SharedFileButton(props: Props) {
    const dispatch = useAppDispatch();

    function openSharedFileOverlay(): void {
        if (props.isShownInChatThreadMessage === true) {
            dispatch(setChatSharedFileInOverlay(props.sharedFile));
        } else {
            dispatch(setChatterSharedFileInOverlay(props.sharedFile));
        }
    }

    const chatThreadMessageStyle = props.isShownInChatThreadMessage ? "in-chat-thread-message" : "";
    return <button
        className={`shared-file-button ${chatThreadMessageStyle}`}
        onClick={() => openSharedFileOverlay()}
    >
        <img className="shared-file-button-thumbnail" src={props.sharedFile.getFileUrl()} alt={props.sharedFile.getFileName()}/>
    </button>
}
