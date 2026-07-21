import SharedFile from "../../classes/SharedFile";
import "./SharedFileButton.css";

interface Props {
    sharedFile: SharedFile;
}

export default function SharedFileButton(props: Props) {
    return <button className="shared-file-button">
        <img className="shared-file-button-thumbnail" src={props.sharedFile.getFileUrl()} alt={props.sharedFile.getFileName()}/>
    </button>
}
