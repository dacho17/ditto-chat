package com.ditto_chat.ditto_chat_server.dtos;

import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ChatThreadMessageDto {
    private String id;
    private String messageSenderId;
    private String messageContent;
    private SharedFileDto attachedFile;
    private Timestamp messageRegisteredAt;
    @JsonProperty("isMessageSeen")
    private boolean isMessageSeen;
    
    public ChatThreadMessageDto(String id, String messageSenderId, String messageContent, SharedFileDto attachedFile,
            Timestamp messageRegisteredAt, boolean isMessageSeen) {
        this.id = id;
        this.messageSenderId = messageSenderId;
        this.messageContent = messageContent;
        this.attachedFile = attachedFile;
        this.messageRegisteredAt = messageRegisteredAt;
        this.isMessageSeen = isMessageSeen;
    }

    public String getId() {
        return id;
    }

    public String getMessageSenderId() {
        return messageSenderId;
    }

    public String getMessageContent() {
        return messageContent;
    }

    public SharedFileDto getAttachedFile() {
        return attachedFile;
    }

    public Timestamp getMessageRegisteredAt() {
        return messageRegisteredAt;
    }

    public boolean isMessageSeen() {
        return isMessageSeen;
    }    
}
