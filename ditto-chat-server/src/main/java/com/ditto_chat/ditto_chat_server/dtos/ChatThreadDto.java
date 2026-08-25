package com.ditto_chat.ditto_chat_server.dtos;

public class ChatThreadDto {
    private ChatThreadOverviewDto chatThreadOverview;
    private ResponsePagedListDto<ChatThreadMessageDto> chatThreadMessages;
    
    public ChatThreadDto(ChatThreadOverviewDto chatThreadOverview, ResponsePagedListDto<ChatThreadMessageDto> chatThreadMessages) {
        this.chatThreadOverview = chatThreadOverview;
        this.chatThreadMessages = chatThreadMessages;
    }

    public ChatThreadOverviewDto getChatThreadOverview() {
        return chatThreadOverview;
    }

    public ResponsePagedListDto<ChatThreadMessageDto> getChatThreadMessages() {
        return chatThreadMessages;
    }
}
