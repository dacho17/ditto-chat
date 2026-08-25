package com.ditto_chat.ditto_chat_server.mappers;

import com.ditto_chat.ditto_chat_server.dtos.UploadedFileToS3NotificationDto;
import com.ditto_chat.ditto_chat_server.entities.UploadFileIntent;
import com.ditto_chat.ditto_chat_server.entities.UploadedFile;
import com.ditto_chat.ditto_chat_server.utils.CryptoTool;
import com.ditto_chat.ditto_chat_server.utils.TimeTool;

public class UploadedFileMapper {
    
    public static UploadedFile createUploadedFileFromUploadFileIntent(UploadFileIntent uploadFileIntent, UploadedFileToS3NotificationDto uploadedFileToS3NotificationDto) {
        return new UploadedFile(
            CryptoTool.generateUUID(),
            TimeTool.getCurrentTimestamp(),
            uploadedFileToS3NotificationDto.getUploadEventId(),
            uploadedFileToS3NotificationDto.getUploadEventTime(),
            uploadFileIntent
        );
    }
}
