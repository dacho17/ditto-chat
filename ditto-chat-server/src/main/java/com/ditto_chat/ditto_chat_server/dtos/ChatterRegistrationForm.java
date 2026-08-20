package com.ditto_chat.ditto_chat_server.dtos;

public class ChatterRegistrationForm {
    private String name;
    private String surname;
    private String username;
    private String email;
    private String password;
    
    public ChatterRegistrationForm(String name, String surname, String username, String email, String password) {
        this.name = name;
        this.surname = surname;
        this.username = username;
        this.email = email;
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public String getSurname() {
        return surname;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }    
}
