import SharedFileButton from "../sharedFileButton/SharedFileButton";
import ChatterIconImage from '../../../assets/david-chat-image.jpg';
import "./SharedFilesList.css";

const SHARED_FILES_TITLE = "Shared Files";
const DUMMY_SHARED_FILES = [
    {
        fileName: "Ditto",
        fileImageUrl: ChatterIconImage
    },
    {
        fileName: "Handsome boy",
        fileImageUrl: ChatterIconImage
    },
    {
        fileName: "Ditto",
        fileImageUrl: ChatterIconImage
    },
    {
        fileName: "Ditto",
        fileImageUrl: ChatterIconImage
    },
    {
        fileName: "Handsome boy",
        fileImageUrl: ChatterIconImage
    }
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
                            fileName={sharedFile.fileName}
                            fileImageUrl={sharedFile.fileImageUrl}
                        />
                    </div>
                </>
            })}
        </div>
    </div>
}
