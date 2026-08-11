import CONSTANTS from "../../Constants";

export default class Validator {
    public static validateUploadChatThreadMessageAttachedFileType(inputFileType: string): boolean {
        const VALID_ATTACHED_FILE_TYPES = [CONSTANTS.INPUT_FILE_TYPE_PDF, CONSTANTS.INPUT_FILE_TYPE_TEXT, CONSTANTS.INPUT_FILE_TYPE_PNG, CONSTANTS.INPUT_FILE_TYPE_JPEG];
        return VALID_ATTACHED_FILE_TYPES.includes(inputFileType);
    }

    public static validateUploadAccountImageFileType(inputFileType: string): boolean {
        const VALID_ACCOUNT_IMAGE_FILE_TYPES = [CONSTANTS.INPUT_FILE_TYPE_PNG, CONSTANTS.INPUT_FILE_TYPE_JPEG];
        return VALID_ACCOUNT_IMAGE_FILE_TYPES.includes(inputFileType);
    }

    public static validateSharedFileSize(fileSizeInBytes: number): boolean {
        const MAXIMUM_ACCOUNT_IMAGE_FILE_SIZE_IN_BYTES = 2097152; // Number of Bytes in 2 MB
        return MAXIMUM_ACCOUNT_IMAGE_FILE_SIZE_IN_BYTES >= fileSizeInBytes;
    }
}

