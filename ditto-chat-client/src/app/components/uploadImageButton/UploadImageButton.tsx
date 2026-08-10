import { ChangeEvent, useRef } from "react";
import IconContainer from "../iconContainer/IconContainer";
import LoadingSpinner from "../loadingSpinner/LoadingSpinner";
import UploadFileIntent from "../../classes/UploadFileIntent";
import "./UploadImageButton.css";

// Button is imagined to have either Text or Icon content
interface Props {
    buttonText: string | null;
    buttonIcon: React.JSX.Element | null;
    uploadFunction: (fileMetadata: UploadFileIntent, fileContentStream: ReadableStream) => Promise<void>;
    isCurrentlyUploading: boolean;
}

export default function UploadImageButton(props: Props) {
    const uploadImageInput = useRef<HTMLInputElement>(null);

    function onClickOpenUploadFileWindow() {
        uploadImageInput.current.click();
    }

    function getButtonContent(): React.JSX.Element {
        if (props.buttonText !== null) {
            return <div className="upload-image-button-text">
                {props.buttonText}
            </div>
        } else if (props.buttonIcon !== null) {
            return <IconContainer icon={props.buttonIcon} />
        } else {
            throw new Error("Button content must be either Text or Icon");
        }
    }

    return <button
        className="upload-image-button"
        onClick={() => onClickOpenUploadFileWindow()}
        disabled={props.isCurrentlyUploading === true}
    >
        { props.isCurrentlyUploading === true 
            ? <div className="upload-image-button-loading-spinner-container">
                <LoadingSpinner />
            </div>
            : getButtonContent()
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
