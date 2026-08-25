package com.ditto_chat.ditto_chat_server.entities;

import java.sql.Timestamp;
import java.util.UUID;

import org.hibernate.annotations.JdbcType;
import org.hibernate.type.descriptor.jdbc.VarcharJdbcType;

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
@Table(name = "chat_thread_participant")
public class ChatThreadParticipant {
    @Id
    @JdbcType(VarcharJdbcType.class)
    @Column(name = "id", length = 36)
    private UUID id;

    @Column(name = "joined_chat_thread_at", nullable = false)
    private Timestamp joinedChatThreadAt;

    @Column(name = "cleared_chat_thread_history_at", nullable = true)
    private Timestamp clearedChatThreadHistoryAt;

    @Column(name = "left_chat_thread_at", nullable = true)
    private Timestamp leftChatThreadAt;

    @ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "chatter_id", referencedColumnName = "id", nullable = false, unique = false)
    private Chatter chatter;

    @ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "chat_thread_id", referencedColumnName = "id", nullable = false, unique = false)
    private ChatThread chatThread;

	@OneToOne(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.DETACH, CascadeType.REFRESH}, optional = true)
	@JoinColumn(name = "last_seen_chat_thread_message_id", referencedColumnName = "id", nullable = true)
	private ChatThreadMessage lastSeenChatThreadMessage;

    public ChatThreadParticipant() {}

    public ChatThreadParticipant(UUID id, Timestamp joinedChatThreadAt, Chatter chatter, ChatThread chatThread) {
        this.id = id;
        this.joinedChatThreadAt = joinedChatThreadAt;
        this.chatter = chatter;
        this.chatThread = chatThread;
    }

    public UUID getId() {
        return id;
    }

    public Timestamp getJoinedChatThreadAt() {
        return joinedChatThreadAt;
    }

    public Timestamp getClearedChatThreadHistoryAt() {
        return clearedChatThreadHistoryAt;
    }

    public void setClearedChatThreadHistoryAt(Timestamp clearedChatThreadHistoryAt) {
        this.clearedChatThreadHistoryAt = clearedChatThreadHistoryAt;
    }

    public Timestamp getLeftChatThreadAt() {
        return leftChatThreadAt;
    }

    public void setLeftChatThreadAt(Timestamp leftChatThreadAt) {
        this.leftChatThreadAt = leftChatThreadAt;
    }

    public Chatter getChatter() {
        return chatter;
    }

    public ChatThread getChatThread() {
        return chatThread;
    }

    public ChatThreadMessage getLastSeenChatThreadMessage() {
        return lastSeenChatThreadMessage;
    }

    public void setLastSeenChatThreadMessage(ChatThreadMessage lastSeenChatThreadMessage) {
        this.lastSeenChatThreadMessage = lastSeenChatThreadMessage;
    }
}
