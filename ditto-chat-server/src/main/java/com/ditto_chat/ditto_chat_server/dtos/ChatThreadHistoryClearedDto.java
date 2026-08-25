package com.ditto_chat.ditto_chat_server.dtos;

import java.sql.Timestamp;

public class ChatThreadHistoryClearedDto {
    private Timestamp chatThreadHistoryClearedAt;

    public ChatThreadHistoryClearedDto(Timestamp chatThreadHistoryClearedAt) {
        this.chatThreadHistoryClearedAt = chatThreadHistoryClearedAt;
    }

    public Timestamp getChatThreadHistoryClearedAt() {
        return chatThreadHistoryClearedAt;
    }   
}
