package com.ditto_chat.ditto_chat_server.dtos;

public class AccountImageDto {
    private String fileUrl;

    public AccountImageDto(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getFileUrl() {
        return fileUrl;
    }
}
