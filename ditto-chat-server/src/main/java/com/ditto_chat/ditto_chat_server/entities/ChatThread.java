package com.ditto_chat.ditto_chat_server.entities;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.JdbcType;
import org.hibernate.type.descriptor.jdbc.VarcharJdbcType;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "chat_thread")
public class ChatThread {
    @Id
    @JdbcType(VarcharJdbcType.class)
    @Column(name = "id", length = 36)
    private UUID id;

    @Column(name = "is_group_chat_thread", nullable = false)
    private boolean isGroupChatThread;

    @Column(name = "created_at", nullable = false)
    private Timestamp createdAt;

    @OneToMany(mappedBy = "chatThread", fetch = FetchType.LAZY, cascade = {CascadeType.DETACH, CascadeType.REFRESH})
	private List<ChatThreadParticipant> chatThreadParticipants;

    @OneToMany(mappedBy = "chatThread", fetch = FetchType.LAZY, cascade = {CascadeType.DETACH, CascadeType.REFRESH})
	private List<ChatThreadMessage> chatThreadMessages;

	@OneToOne(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.DETACH, CascadeType.REFRESH}, optional = true)
	@JoinColumn(name = "last_chat_thread_message_id", referencedColumnName = "id", nullable = true)
	private ChatThreadMessage lastChatThreadMessage;

    public ChatThread(UUID id, boolean isGroupChatThread, Timestamp createdAt, List<ChatThreadParticipant> chatThreadParticipants) {
        this.id = id;
        this.isGroupChatThread = isGroupChatThread;
        this.createdAt = createdAt;
        this.chatThreadParticipants = chatThreadParticipants;
    }

    public UUID getId() {
        return id;
    }

    public boolean getIsGroupChatThread() {
        return isGroupChatThread;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public List<ChatThreadParticipant> getChatThreadParticipants() {
        return chatThreadParticipants;
    }

    public List<ChatThreadMessage> getChatThreadMessages() {
        return chatThreadMessages;
    }

    public ChatThreadMessage getLastChatThreadMessage() {
        return lastChatThreadMessage;
    }

    public void setLastChatThreadMessage(ChatThreadMessage lastChatThreadMessage) {
        this.lastChatThreadMessage = lastChatThreadMessage;
    }    
}
