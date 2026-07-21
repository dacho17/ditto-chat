import { useRef } from "react";
import "./UploadImageButton.css";

interface Props {
    buttonText: string;
    uploadFunction: Function
}

export default function UploadImageButton(props: Props) {
    const uploadImageInput = useRef<HTMLInputElement>(null);

    function onClickOpenUploadFileWindow() {
        uploadImageInput.current.click();
    }

    return <button
        className="upload-image-button"
        onClick={() => onClickOpenUploadFileWindow()}
    >
        <div className="upload-image-button-text">
            {props.buttonText}
        </div>
        <input
            className="upload-image-button-input"
            name="upload-image"
            type="file"
            accept="image/*"
            ref={uploadImageInput}
            multiple={false}
            disabled={false}
            onChange={() => props.uploadFunction()}
        />
    </button>
}
