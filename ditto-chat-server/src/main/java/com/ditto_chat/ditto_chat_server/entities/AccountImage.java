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
@Table(name = "account_image")
public class AccountImage {
    @Id
    @JdbcType(VarcharJdbcType.class)
    @Column(name = "id", length = 36)
    private UUID id;
    
    @Column(name = "replaced_at", nullable = true)
    private Timestamp replacedAt;

    @ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "chatter_id", referencedColumnName = "id", nullable = false, unique = false)
	private Chatter chatter;

	@OneToOne(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.DETACH, CascadeType.REFRESH}, optional = false)
	@JoinColumn(name = "uploaded_file_id", referencedColumnName = "id", nullable = false, unique = true)
	private UploadedFile uploadedFile;

    public AccountImage(UUID id, Chatter chatter, UploadedFile uploadedFile) {
        this.id = id;
        this.chatter = chatter;
        this.uploadedFile = uploadedFile;
    }

    public UUID getId() {
        return id;
    }

    public Timestamp getReplacedAt() {
        return replacedAt;
    }

    public void setReplacedAt(Timestamp replacedAt) {
        this.replacedAt = replacedAt;
    }

    public Chatter getChatter() {
        return chatter;
    }

    public UploadedFile getUploadedFile() {
        return uploadedFile;
    }
}
