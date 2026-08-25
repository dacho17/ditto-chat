package com.ditto_chat.ditto_chat_server.dtos;

import java.sql.Timestamp;

import com.ditto_chat.ditto_chat_server.enums.UploadedFileType;

public class SharedFileDto {
    private String fileName;
    private UploadedFileType sharedFileType;
    private String fileUrl;
    private Timestamp fileSharedAt;
    private String fileSharedByChatterId;
    
    public SharedFileDto(String fileName, UploadedFileType sharedFileType, String fileUrl, Timestamp fileSharedAt,
            String fileSharedByChatterId) {
        this.fileName = fileName;
        this.sharedFileType = sharedFileType;
        this.fileUrl = fileUrl;
        this.fileSharedAt = fileSharedAt;
        this.fileSharedByChatterId = fileSharedByChatterId;
    }

    public String getFileName() {
        return fileName;
    }

    public UploadedFileType getSharedFileType() {
        return sharedFileType;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public Timestamp getFileSharedAt() {
        return fileSharedAt;
    }

    public String getFileSharedByChatterId() {
        return fileSharedByChatterId;
    }    
}
