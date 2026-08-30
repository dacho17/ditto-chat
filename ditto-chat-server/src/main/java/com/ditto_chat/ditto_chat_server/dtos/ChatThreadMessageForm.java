package com.ditto_chat.ditto_chat_server.dtos;

public class ChatThreadMessageForm {
    private String messageContent;
    private String attachedFileS3ObjectKey;
    
    public ChatThreadMessageForm(String messageContent, String attachedFileS3ObjectKey) {
        this.messageContent = messageContent;
        this.attachedFileS3ObjectKey = attachedFileS3ObjectKey;
    }

    public String getMessageContent() {
        return messageContent;
    }

    public String getAttachedFileS3ObjectKey() {
        return attachedFileS3ObjectKey;
    }

    public boolean isAttachmentSent() {
        return this.attachedFileS3ObjectKey != null;
    }
}
