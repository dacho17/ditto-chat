package com.ditto_chat.ditto_chat_server.dtos;

public class ChatterOverviewDto {
    private final String id;
    private final String chatterName;
    private final String chatterSurname;
    private final String chatterUsername;
    private final String chatterEmail;
    private final String chatterImageUrl;
    private final boolean isChatterOnline;
    private final String chatThreadId;

    public ChatterOverviewDto(String id, String chatterName, String chatterSurname, String chatterUsername,
            String chatterEmail, String chatterImageUrl, boolean isChatterOnline, String chatThreadId) {
        this.id = id;
        this.chatterName = chatterName;
        this.chatterSurname = chatterSurname;
        this.chatterUsername = chatterUsername;
        this.chatterEmail = chatterEmail;
        this.chatterImageUrl = chatterImageUrl;
        this.isChatterOnline = isChatterOnline;
        this.chatThreadId = chatThreadId;
    }

    public String getId() {
        return id;
    }

    public String getChatterName() {
        return chatterName;
    }

    public String getChatterSurname() {
        return chatterSurname;
    }

    public String getChatterUsername() {
        return chatterUsername;
    }

    public String getChatterEmail() {
        return chatterEmail;
    }

    public String getChatterImageUrl() {
        return chatterImageUrl;
    }

    public boolean isChatterOnline() {
        return isChatterOnline;
    }

    public String getChatThreadId() {
        return chatThreadId;
    }
}
