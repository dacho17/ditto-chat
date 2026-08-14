import CONSTANTS from "../../Constants";

export const VALID_ACCOUNT_IMAGE_FILE_TYPES = [CONSTANTS.INPUT_FILE_TYPE_PNG, CONSTANTS.INPUT_FILE_TYPE_JPEG];
export const VALID_ATTACHED_FILE_TYPES = [CONSTANTS.INPUT_FILE_TYPE_PDF, CONSTANTS.INPUT_FILE_TYPE_TEXT, CONSTANTS.INPUT_FILE_TYPE_PNG, CONSTANTS.INPUT_FILE_TYPE_JPEG];
const MAXIMUM_ACCOUNT_IMAGE_FILE_SIZE_IN_BYTES = 2097152; // Number of Bytes in 2 MB
export default class Validator {
    public static validateChatterName(name: string): boolean {
        const MINIMAL_CHATTER_NAME_LENGTH = 2;

        return name !== null && name !== undefined && name.trim().length >= MINIMAL_CHATTER_NAME_LENGTH;
    }

    public static validateChatterUsername(username: string): boolean {
        const MINIMAL_CHATTER_USERNAME_LENGTH = 6;

        return username !== null && username !== undefined && username.trim().length >= MINIMAL_CHATTER_USERNAME_LENGTH;
    }

    public static validateEmail(emailCandidate: string): boolean {
        if (emailCandidate === null || emailCandidate === undefined) return false;

        const trimmedEmailCandidate = emailCandidate.trim();
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(trimmedEmailCandidate);
    }

    public static validatePassword(password: string): boolean {
        const MINIMAL_PASSWORD_LENGTH = 6;

        if (password === null || password === undefined) return false;

        return password.trim().length >= MINIMAL_PASSWORD_LENGTH;
    }

    public static validateChatThreadMessageContent(messageContent: String): boolean {
        return messageContent !== null && messageContent !== undefined && messageContent.trim().length > 0;
    }

    public static validateUploadChatThreadMessageAttachedFileType(inputFileType: string): boolean {
        return VALID_ATTACHED_FILE_TYPES.includes(inputFileType);
    }

    public static validateUploadAccountImageFileType(inputFileType: string): boolean {
        return VALID_ACCOUNT_IMAGE_FILE_TYPES.includes(inputFileType);
    }

    public static validateSharedFileSize(fileSizeInBytes: number): boolean {
        return MAXIMUM_ACCOUNT_IMAGE_FILE_SIZE_IN_BYTES >= fileSizeInBytes;
    }
}

