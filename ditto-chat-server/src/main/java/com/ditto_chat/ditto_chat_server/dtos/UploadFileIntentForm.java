package com.ditto_chat.ditto_chat_server.dtos;

import com.ditto_chat.ditto_chat_server.enums.FilePurpose;
import com.ditto_chat.ditto_chat_server.enums.UploadedFileType;

public class UploadFileIntentForm {
    private String fileName;
    private UploadedFileType fileType;
    private Integer fileSize;
    private FilePurpose filePurpose;

    public UploadFileIntentForm(String fileName, UploadedFileType fileType, Integer fileSize, FilePurpose filePurpose) {
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.filePurpose = filePurpose;
    }

    public String getFileName() {
        return fileName;
    }

    public UploadedFileType getFileType() {
        return fileType;
    }

    public Integer getFileSize() {
        return fileSize;
    }

    public FilePurpose getFilePurpose() {
        return filePurpose;
    }     
}
