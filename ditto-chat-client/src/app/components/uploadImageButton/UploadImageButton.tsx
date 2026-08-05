import { ChangeEvent, useRef } from "react";
import LoadingSpinner from "../loadingSpinner/LoadingSpinner";
import UploadFileIntent from "../../classes/UploadFileIntent";
import "./UploadImageButton.css";

interface Props {
    buttonText: string;
    uploadFunction: (fileMetadata: UploadFileIntent, fileContentStream: ReadableStream) => Promise<void>;
    isCurrentlyUploading: boolean;
}

export default function UploadImageButton(props: Props) {
    const uploadImageInput = useRef<HTMLInputElement>(null);

    function onClickOpenUploadFileWindow() {
        uploadImageInput.current.click();
    }

    return <button
        className="upload-image-button"
        onClick={() => onClickOpenUploadFileWindow()}
        disabled={props.isCurrentlyUploading}
    >
        { props.isCurrentlyUploading === true 
            ? <LoadingSpinner />
            : <div className="upload-image-button-text">
                {props.buttonText}
            </div>
        }
        <input
            className="upload-image-button-input"
            name="upload-image"
            type="file"
            accept="image/*"
            ref={uploadImageInput}
            multiple={false}
            disabled={false}
            onChange={(_: ChangeEvent) => {
                if (uploadImageInput.current.files.length === 0) {
                    return; // do nothing
                }

                const fileName = uploadImageInput.current.files.item(0).name;
                const fileType = uploadImageInput.current.files.item(0).type;
                const fileSize = uploadImageInput.current.files.item(0).size;
                const fileContentStream = uploadImageInput.current.files.item(0).stream();

                const selectedFileMetadata = new UploadFileIntent(fileName, fileType, fileSize);
                props.uploadFunction(selectedFileMetadata, fileContentStream);
            }}
        />
    </button>
}
