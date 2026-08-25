package com.ditto_chat.ditto_chat_server.validators;

import com.ditto_chat.ditto_chat_server.dtos.UploadFileIntentForm;
import com.ditto_chat.ditto_chat_server.dtos.UploadedFileToS3NotificationDto;
import com.ditto_chat.ditto_chat_server.enums.FilePurpose;
import com.ditto_chat.ditto_chat_server.enums.UploadedFileType;

public class AwsValidator extends GeneralValidator {
    private static final short MINIMUM_FILE_NAME_LENGTH = 2;
    private static final short MAXIMUM_FILE_NAME_LENGTH = 128;
    private static final short MAXIMUM_S3_OBJECT_KEY_LENGTH = 256;
    private static final short MAXIMUM_UPLOAD_EVENT_ID_LENGTH = 64;
    private static final int MAXIMUM_FILE_SIZE_IN_BYTES = 2097152;

    public static void validateUploadFileIntentForm(UploadFileIntentForm uploadFileIntentForm) {
        boolean isFileNameValid = AwsValidator.validateFileName(uploadFileIntentForm.getFileName());
		if (isFileNameValid == false) {
			throwValidationException(String.format("FileName validation has failed in validateUploadFileIntentForm for fileName=%s.", 
				uploadFileIntentForm.getFileName()));
		}

        boolean isFileSizeValid = AwsValidator.validateFileSize(uploadFileIntentForm.getFileSize());
		if (isFileSizeValid == false) {
			throwValidationException(String.format("FileSize validation has failed in validateUploadFileIntentForm for fileSize=%d.", 
				uploadFileIntentForm.getFileSize()));
		}

        switch (uploadFileIntentForm.getFilePurpose()) {
            case FilePurpose.ACCOUNT_IMAGE:
                boolean isImageFileType = UploadedFileType.isUploadedFileTypeAnImage(uploadFileIntentForm.getFileType());
                if (isImageFileType == false) {
                    throwValidationException(String.format("File with FilePurpose=%s is expected to be of a image type, and it is recognized as fileType=%s in validateUploadFileIntentForm. FileType is invalid.",
                        uploadFileIntentForm.getFilePurpose(), uploadFileIntentForm.getFileType()));
                }
                break;
            case FilePurpose.MESSAGE_ATTACHMENT:
                boolean isMessageAttachmentFileType = UploadedFileType.isUploadedFileTypeBeAMessageAttachment(uploadFileIntentForm.getFileType());
                if (isMessageAttachmentFileType == false) {
                    throwValidationException(String.format("File with FilePurpose=%s is expected to be of a message attachment type, and it is recognized as fileType=%s in validateUploadFileIntentForm. FileType is invalid.",
                        uploadFileIntentForm.getFilePurpose(), uploadFileIntentForm.getFileType()));
                }
                break;
            default:
                throwValidationException(String.format("FilePurpose=%s was not recognized in validateUploadFileIntentForm.", uploadFileIntentForm.getFilePurpose()));
        }
    }

    public static void validateUploadedFileToS3NotificationDto(UploadedFileToS3NotificationDto uploadedFileToS3NotificationDto) {
        boolean isS3ObjectKeyValid = validateS3ObjectKey(uploadedFileToS3NotificationDto.getObjectKey());
		if (isS3ObjectKeyValid == false) {
			throwValidationException(String.format("S3ObjectKey validation has failed during validateUploadedFileToS3NotificationDto for s3ObjectKey=%s.", uploadedFileToS3NotificationDto.getObjectKey()));
		}

        boolean isUploadEventIdValid = validateUploadEventId(uploadedFileToS3NotificationDto.getUploadEventId());
		if (isUploadEventIdValid == false) {
			throwValidationException(String.format("uploadEventId validation has failed during validateUploadedFileToS3NotificationDto for uploadEventId=%s.", uploadedFileToS3NotificationDto.getUploadEventId()));
		}
    }

    private static boolean validateFileName(String fileName) {
        return fileName != null
            && AwsValidator.MINIMUM_FILE_NAME_LENGTH <= fileName.trim().length()
            && fileName.trim().length() <= AwsValidator.MAXIMUM_FILE_NAME_LENGTH
        ;
    }

    private static boolean validateFileSize(Integer fileSize) {
        return fileSize != null && 0 < fileSize && fileSize <= AwsValidator.MAXIMUM_FILE_SIZE_IN_BYTES;
    }

    private static boolean validateS3ObjectKey(String s3ObjectKey) {
        return s3ObjectKey != null
            && AwsValidator.MINIMUM_FILE_NAME_LENGTH <= s3ObjectKey.trim().length()
            && s3ObjectKey.trim().length() <= AwsValidator.MAXIMUM_S3_OBJECT_KEY_LENGTH
        ;
    }

    private static boolean validateUploadEventId(String uploadEventId) {
        return uploadEventId != null
            && AwsValidator.MINIMUM_FILE_NAME_LENGTH <= uploadEventId.trim().length()
            && uploadEventId.trim().length() <= AwsValidator.MAXIMUM_UPLOAD_EVENT_ID_LENGTH
        ;
    }
}
