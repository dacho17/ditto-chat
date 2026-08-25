package com.ditto_chat.ditto_chat_server.entities;

import java.util.UUID;

import org.hibernate.annotations.JdbcType;
import org.hibernate.type.descriptor.jdbc.VarcharJdbcType;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "shared_file")
public class SharedFile {
    @Id
    @JdbcType(VarcharJdbcType.class)
    @Column(name = "id", length = 36)
    private UUID id;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "chat_thread_message_id", referencedColumnName = "id", nullable = false, unique = true)
	private ChatThreadMessage chatThreadMessage;

	@OneToOne(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.DETACH, CascadeType.REFRESH}, optional = false)
	@JoinColumn(name = "uploaded_file_id", referencedColumnName = "id", nullable = false, unique = true)
	private UploadedFile uploadedFile;

	public SharedFile() {}

	public SharedFile(UUID id, ChatThreadMessage chatThreadMessage, UploadedFile uploadedFile) {
		this.id = id;
		this.chatThreadMessage = chatThreadMessage;
		this.uploadedFile = uploadedFile;
	}

	public UUID getId() {
		return id;
	}

	public ChatThreadMessage getChatThreadMessage() {
		return chatThreadMessage;
	}

	public UploadedFile getUploadedFile() {
		return uploadedFile;
	}	
}
