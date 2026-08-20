package com.ditto_chat.ditto_chat_server.dtos;

public class ForgotPasswordForm {
    private String email;

    public ForgotPasswordForm(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }
}
