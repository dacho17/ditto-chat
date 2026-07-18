import "./SharedFileButton.css";

interface Props {
    fileName: string;
    fileImageUrl: string;
}

export default function SharedFileButton(props: Props) {
    return <button className="shared-file-button">
        <img className="shared-file-button-thumbnail" src={props.fileImageUrl} alt={props.fileName}/>
    </button>
}
