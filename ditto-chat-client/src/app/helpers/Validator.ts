import UploadFileIntent from "../classes/UploadFileIntent";

export default class Validator {
    public static validateUploadChatThreadMessageAttachedFile(uploadFileIntent: UploadFileIntent): boolean {
        const VALID_ATTACHED_FILE_TYPES = ["application/pdf", "text/plain", "image/png", "image/jpeg"];
        return Validator.validateUploadFileIntent(uploadFileIntent, VALID_ATTACHED_FILE_TYPES);
    }

    public static validateUploadChatterImage(uploadFileIntent: UploadFileIntent): boolean {
        const VALID_ACCOUNT_IMAGE_FILE_TYPES = ["image/png", "image/jpeg"];
        return Validator.validateUploadFileIntent(uploadFileIntent, VALID_ACCOUNT_IMAGE_FILE_TYPES);
    }

    private static validateUploadFileIntent(uploadFileIntent: UploadFileIntent, validFileTypes: string[]): boolean {        
        const MAXIMUM_ACCOUNT_IMAGE_FILE_SIZE_IN_BYTES = 2097152; // Number of Bytes in 2 MB

        const fileType = uploadFileIntent.getFileType();
        if (validFileTypes.includes(fileType) === false) {
            console.log("TODO-toasting: Notify user that they are attepmting to upload unsupported File Type. Tell them what passes");
            return false;
        }

        if (MAXIMUM_ACCOUNT_IMAGE_FILE_SIZE_IN_BYTES < uploadFileIntent.getFileSize()) {
            console.log("TODO-toasting: Notify user that they are attepmting to upload File of size over 2 MBs.");
            return false;
        }

        return true;
    }
}
