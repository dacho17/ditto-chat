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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "chatter")
public class Chatter {
    @Id
    @JdbcType(VarcharJdbcType.class)
    @Column(name = "id", length = 36)
    private UUID id;

    @Column(name = "name", nullable = false, unique = false, length = 128)
    private String name;

    @Column(name = "surname", nullable = false, unique = false, length = 128)
    private String surname;

    @Column(name = "username", nullable = false, unique = true, length = 128)
    private String username;

    @Column(name = "email", nullable = false, unique = true, length = 128)
    private String email;

    @Column(name = "password", nullable = false, unique = false, length = 128)
    private String password;

    @Column(name = "created_at", nullable = false)
    private Timestamp createdAt;

    @Column(name = "last_login_at", nullable = true)
    private Timestamp lastLoginAt;

    @Column(name = "password_reset_token_hash", nullable = true, unique = false, length = 256)
    private String passwordResetTokenHash;

    @Column(name = "password_reset_valid_until", nullable = true)
    private Timestamp passwordResetValidUntil;

    @OneToMany(mappedBy = "chatter", fetch = FetchType.LAZY, cascade = {CascadeType.DETACH, CascadeType.REFRESH})
	private List<AccountImage> accountImages;

    @OneToMany(mappedBy = "chatter", fetch = FetchType.LAZY, cascade = {CascadeType.DETACH, CascadeType.REFRESH})
	private List<ChatThreadParticipant> chatThreadParticipants;

    public Chatter(UUID id, String name, String surname, String username, String email, String password,
            Timestamp createdAt) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.username = username;
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSurname() {
        return surname;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public Timestamp getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(Timestamp lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    public String getPasswordResetTokenHash() {
        return passwordResetTokenHash;
    }

    public void setPasswordResetTokenHash(String passwordResetTokenHash) {
        this.passwordResetTokenHash = passwordResetTokenHash;
    }

    public Timestamp getPasswordResetValidUntil() {
        return passwordResetValidUntil;
    }

    public void setPasswordResetValidUntil(Timestamp passwordResetValidUntil) {
        this.passwordResetValidUntil = passwordResetValidUntil;
    }

    public List<AccountImage> getAccountImages() {
        return accountImages;
    }
    public List<ChatThreadParticipant> getChatThreadParticipants() {
        return chatThreadParticipants;
    }
}
