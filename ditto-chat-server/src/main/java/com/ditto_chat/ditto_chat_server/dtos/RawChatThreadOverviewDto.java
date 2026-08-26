package com.ditto_chat.ditto_chat_server.dtos;

import com.ditto_chat.ditto_chat_server.entities.AccountImage;
import com.ditto_chat.ditto_chat_server.entities.ChatThread;
import com.ditto_chat.ditto_chat_server.entities.ChatThreadParticipant;

public class RawChatThreadOverviewDto {
    private ChatThread chatThread;
    private Integer numberOfUnseenMessagesByLoggedInChatter;
    private ChatThreadParticipant loggedInChatThreadParticipant;
    private ChatThreadParticipant peerChatThreadParticipant;
    private AccountImage peerAccountImage;
    
    public RawChatThreadOverviewDto(ChatThread chatThread, Integer numberOfUnseenMessagesByLoggedInChatter,
            ChatThreadParticipant loggedInChatThreadParticipant, ChatThreadParticipant peerChatThreadParticipant,
            AccountImage peerAccountImage) {
        this.chatThread = chatThread;
        this.numberOfUnseenMessagesByLoggedInChatter = numberOfUnseenMessagesByLoggedInChatter;
        this.loggedInChatThreadParticipant = loggedInChatThreadParticipant;
        this.peerChatThreadParticipant = peerChatThreadParticipant;
        this.peerAccountImage = peerAccountImage;
    }

    public ChatThread getChatThread() {
        return chatThread;
    }

    public Integer getNumberOfUnseenMessagesByLoggedInChatter() {
        return numberOfUnseenMessagesByLoggedInChatter;
    }

    public ChatThreadParticipant getLoggedInChatThreadParticipant() {
        return loggedInChatThreadParticipant;
    }

    public ChatThreadParticipant getPeerChatThreadParticipant() {
        return peerChatThreadParticipant;
    }

    public AccountImage getPeerAccountImage() {
        return peerAccountImage;
    }    
}
