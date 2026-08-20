package com.ditto_chat.ditto_chat_server.dtos;

public class LoginForm {
    private String email;
    private String password;
    
    public LoginForm(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }
}
