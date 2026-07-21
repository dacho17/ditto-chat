import SharedFileButton from "../sharedFileButton/SharedFileButton";
import SharedFile from "../../classes/SharedFile";
import ChatterIconImage from '../../../assets/david-chat-image.jpg';
import "./SharedFilesList.css";

const SHARED_FILES_TITLE = "Shared Files";
const DUMMY_SHARED_FILES: SharedFile[] = [
    new SharedFile("Ditto", ChatterIconImage),
    new SharedFile("Handsome man", ChatterIconImage),
    new SharedFile("Ditto", ChatterIconImage),
    new SharedFile("Ditto", ChatterIconImage),
    new SharedFile("Handsome man", ChatterIconImage)
];

export default function SharedFilesList() {
    return <div className="shared-files-list">
        <div className="bold-text">
            {SHARED_FILES_TITLE}
            <div className="margin-bottom-2" />
        </div>
        <div className="shared-files-list-files">
            { DUMMY_SHARED_FILES.map(sharedFile => {
                return <>
                    <div className="margin-bottom-1 margin-right-1">
                        <SharedFileButton
                            sharedFile={sharedFile}
                        />
                    </div>
                </>
            })}
        </div>
    </div>
}
