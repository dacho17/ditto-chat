package com.ditto_chat.ditto_chat_server.entities;

import java.sql.Timestamp;
import java.util.UUID;

import org.hibernate.annotations.JdbcType;
import org.hibernate.type.descriptor.jdbc.VarcharJdbcType;

import com.ditto_chat.ditto_chat_server.utils.CryptoTool;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "chat_thread_message")
public class ChatThreadMessage {
    @Id
    @JdbcType(VarcharJdbcType.class)
    @Column(name = "id", length = 36)
    private UUID id;
    
    @Column(name = "message_content", nullable = false, unique = false, length = 2048)
    private String messageContent;

    @Column(name = "message_registered_at", nullable = false)
    private Timestamp messageRegisteredAt;

    @ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "sender_chat_thread_participant_id", referencedColumnName = "id", nullable = false, unique = false)
    private ChatThreadParticipant senderChatThreadParticipant;

    @ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "chat_thread_id", referencedColumnName = "id", nullable = false, unique = false)
    private ChatThread chatThread;

    @OneToOne(mappedBy = "chatThreadMessage", cascade = {CascadeType.PERSIST, CascadeType.DETACH, CascadeType.REFRESH}, optional = true)
	private SharedFile sharedFile;

    public ChatThreadMessage() {}

    public ChatThreadMessage(UUID id, String messageContent, Timestamp messageRegisteredAt,
            ChatThreadParticipant senderChatThreadParticipant, ChatThread chatThread, UploadedFile attachedUploadedFile) {
        this.id = id;
        this.messageContent = messageContent;
        this.messageRegisteredAt = messageRegisteredAt;
        this.senderChatThreadParticipant = senderChatThreadParticipant;
        this.chatThread = chatThread;
        this.sharedFile = attachedUploadedFile != null
            ? new SharedFile(CryptoTool.generateUUID(), this, attachedUploadedFile) : null;
    }

    public UUID getId() {
        return id;
    }

    public String getMessageContent() {
        return messageContent;
    }

    public Timestamp getMessageRegisteredAt() {
        return messageRegisteredAt;
    }

    public ChatThreadParticipant getSenderChatThreadParticipant() {
        return senderChatThreadParticipant;
    }

    public ChatThread getChatThread() {
        return chatThread;
    }

    public SharedFile getSharedFile() {
        return sharedFile;
    }
}
