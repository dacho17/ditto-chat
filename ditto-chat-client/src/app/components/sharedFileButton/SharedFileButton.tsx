import SharedFile from "../../classes/SharedFile";
import "./SharedFileButton.css";

interface Props {
    sharedFile: SharedFile;
    isShownInChatThreadMessage: boolean
}

export default function SharedFileButton(props: Props) {
    const chatThreadMessageStyle = props.isShownInChatThreadMessage ? "in-chat-thread-message" : "";

    return <button className={`shared-file-button ${chatThreadMessageStyle}`}>
        <img className="shared-file-button-thumbnail" src={props.sharedFile.getFileUrl()} alt={props.sharedFile.getFileName()}/>
    </button>
}
