package com.ditto_chat.ditto_chat_server.dtos;

public class AccountImageForm {
    private String accountImageFileS3ObjectKey;

    public AccountImageForm(String accountImageFileS3ObjectKey) {
        this.accountImageFileS3ObjectKey = accountImageFileS3ObjectKey;
    }

    public String getAccountImageFileS3ObjectKey() {
        return accountImageFileS3ObjectKey;
    }
}
