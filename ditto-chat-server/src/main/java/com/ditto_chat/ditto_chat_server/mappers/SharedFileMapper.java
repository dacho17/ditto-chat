package com.ditto_chat.ditto_chat_server.mappers;

import java.util.UUID;

import com.ditto_chat.ditto_chat_server.dtos.SharedFileDto;
import com.ditto_chat.ditto_chat_server.entities.SharedFile;
import com.ditto_chat.ditto_chat_server.entities.UploadedFile;
import com.ditto_chat.ditto_chat_server.enums.UploadedFileType;

public class SharedFileMapper {
    public static SharedFileDto fromSharedFileToSharedFileDto(SharedFile sharedFile, UUID senderChatterId) {
        UploadedFile uploadedSharedFile = sharedFile.getUploadedFile();
        return new SharedFileDto(
            uploadedSharedFile.getFileName(),
            UploadedFileType.getUploadedFileType(uploadedSharedFile.getFileType()),
            "TODO-aws",
            uploadedSharedFile.getUploadedAt(),
            senderChatterId.toString()
        );
    }
}
