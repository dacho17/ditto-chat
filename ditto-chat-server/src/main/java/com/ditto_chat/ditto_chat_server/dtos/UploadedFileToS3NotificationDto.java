package com.ditto_chat.ditto_chat_server.dtos;

import java.sql.Timestamp;

public class UploadedFileToS3NotificationDto {
    private String objectKey;
    private String uploadEventId;
    private Timestamp uploadEventTime;
    
    public UploadedFileToS3NotificationDto() {}

    public String getObjectKey() {
        return objectKey;
    }

    public String getUploadEventId() {
        return uploadEventId;
    }

    public Timestamp getUploadEventTime() {
        return uploadEventTime;
    }
}
