package com.ditto_chat.ditto_chat_server.dtos;

import java.sql.Timestamp;

public class ChatThreadOverviewDto {
    private String id;
    private ChatterOverviewDto chatterOverview;
    private Timestamp chatThreadCreatedAt;
    private Integer numberOfUnseenMessages;
    private Timestamp lastMessageTime;
    private String lastMessageContent;
    private String lastSeenByChatterMessageId;
    private String lastSeenByPeerMessageId;
    private Timestamp chatThreadHistoryClearedAt;

    public ChatThreadOverviewDto(String id, ChatterOverviewDto chatterOverview, Timestamp chatThreadCreatedAt,
            Integer numberOfUnseenMessages, Timestamp lastMessageTime, String lastMessageContent,
            String lastSeenByChatterMessageId, String lastSeenByPeerMessageId, Timestamp chatThreadHistoryClearedAt) {
        this.id = id;
        this.chatterOverview = chatterOverview;
        this.chatThreadCreatedAt = chatThreadCreatedAt;
        this.numberOfUnseenMessages = numberOfUnseenMessages;
        this.lastMessageTime = lastMessageTime;
        this.lastMessageContent = lastMessageContent;
        this.lastSeenByChatterMessageId = lastSeenByChatterMessageId;
        this.lastSeenByPeerMessageId = lastSeenByPeerMessageId;
        this.chatThreadHistoryClearedAt = chatThreadHistoryClearedAt;
    }

    public String getId() {
        return id;
    }

    public ChatterOverviewDto getChatterOverview() {
        return chatterOverview;
    }

    public Timestamp getChatThreadCreatedAt() {
        return chatThreadCreatedAt;
    }

    public Integer getNumberOfUnseenMessages() {
        return numberOfUnseenMessages;
    }

    public Timestamp getLastMessageTime() {
        return lastMessageTime;
    }

    public String getLastMessageContent() {
        return lastMessageContent;
    }

    public String getLastSeenByChatterMessageId() {
        return lastSeenByChatterMessageId;
    }

    public String getLastSeenByPeerMessageId() {
        return lastSeenByPeerMessageId;
    }

    public Timestamp getChatThreadHistoryClearedAt() {
        return chatThreadHistoryClearedAt;
    }    
}
