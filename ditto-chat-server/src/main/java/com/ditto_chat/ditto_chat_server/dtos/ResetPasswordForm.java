package com.ditto_chat.ditto_chat_server.dtos;

public class ResetPasswordForm {
    private String password;
    private String repeatedPassword;
    
    public ResetPasswordForm(String password, String repeatedPassword) {
        this.password = password;
        this.repeatedPassword = repeatedPassword;
    }

    public String getPassword() {
        return password;
    }

    public String getRepeatedPassword() {
        return repeatedPassword;
    }
}
