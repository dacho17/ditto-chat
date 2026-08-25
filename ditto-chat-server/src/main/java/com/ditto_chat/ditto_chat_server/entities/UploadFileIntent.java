package com.ditto_chat.ditto_chat_server.entities;

import java.sql.Timestamp;
import java.util.UUID;

import org.hibernate.annotations.JdbcType;
import org.hibernate.type.descriptor.jdbc.VarcharJdbcType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "upload_file_intent")
public class UploadFileIntent {
    @Id
    @JdbcType(VarcharJdbcType.class)
    @Column(name = "id", length = 36)
    private UUID id;

    @Column(name = "file_name", nullable = false, unique = false, length = 128)
    private String fileName;

    @Column(name = "file_type", nullable = false)
    private short fileType;

    @Column(name = "file_size_in_bytes", nullable = false)
    private int fileSizeInBytes;

    @Column(name = "file_purpose", nullable = false)
    private short filePurpose;

    @Column(name = "s3_object_key", nullable = false, unique = true, length = 256)
    private String s3ObjectKey;

    @Column(name = "s3_pre_signed_url_expires_at", nullable = false)
    private Timestamp s3PresignedUrlExpiresAt;

    @Column(name = "created_at", nullable = false)
    private Timestamp createdAt;

    public UploadFileIntent() {}

    public UploadFileIntent(UUID id, String fileName, short fileType, int fileSizeInBytes, short filePurpose, String s3ObjectKey,
            Timestamp s3PresignedUrlExpiresAt, Timestamp createdAt) {
        this.id = id;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSizeInBytes = fileSizeInBytes;
        this.filePurpose = filePurpose;
        this.s3ObjectKey = s3ObjectKey;
        this.s3PresignedUrlExpiresAt = s3PresignedUrlExpiresAt;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public String getFileName() {
        return fileName;
    }

    public short getFileType() {
        return fileType;
    }

    public int getFileSizeInBytes() {
        return fileSizeInBytes;
    }

    public short getFilePurpose() {
        return filePurpose;
    }

    public String getS3ObjectKey() {
        return s3ObjectKey;
    }

    public Timestamp getS3PreSignedUrlExpiresAt() {
        return s3PresignedUrlExpiresAt;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }    
}
