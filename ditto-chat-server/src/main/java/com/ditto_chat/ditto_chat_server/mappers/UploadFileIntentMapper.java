package com.ditto_chat.ditto_chat_server.mappers;

import com.ditto_chat.ditto_chat_server.dtos.S3PreSignedUrlDto;
import com.ditto_chat.ditto_chat_server.dtos.UploadFileIntentForm;
import com.ditto_chat.ditto_chat_server.entities.UploadFileIntent;
import com.ditto_chat.ditto_chat_server.utils.CryptoTool;
import com.ditto_chat.ditto_chat_server.utils.TimeTool;

public class UploadFileIntentMapper {
    public static UploadFileIntent fromUploadFileIntentFormToUploadFileIntent(UploadFileIntentForm uploadFileIntentForm, S3PreSignedUrlDto uploadFileIntentS3PreSignedUrlDto) {
        return new UploadFileIntent(
            CryptoTool.generateUUID(),
            uploadFileIntentForm.getFileName().trim(),
            uploadFileIntentForm.getFileType().getValue(),
            uploadFileIntentForm.getFileSize(),
            uploadFileIntentForm.getFilePurpose().getValue(),
            uploadFileIntentS3PreSignedUrlDto.getS3ObjectKey(),
            uploadFileIntentS3PreSignedUrlDto.getExpiresAt(),
            TimeTool.getCurrentTimestamp()
        );
    }
}
