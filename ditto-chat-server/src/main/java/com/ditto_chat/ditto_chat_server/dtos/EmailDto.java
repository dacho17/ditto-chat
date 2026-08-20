package com.ditto_chat.ditto_chat_server.dtos;

public class EmailDto {
    private String recipient;
    private String subject;
    private String content;
    
    public EmailDto(String recipient, String subject, String content) {
        this.recipient = recipient;
        this.subject = subject;
        this.content = content;
    }

    public String getRecipient() {
        return recipient;
    }

    public String getSubject() {
        return subject;
    }

    public String getContent() {
        return content;
    }

    @Override
    public String toString() {
        return "EmailDto [recipient=" + recipient + ", subject=" + subject + ", content=" + content + "]";
    }
}
