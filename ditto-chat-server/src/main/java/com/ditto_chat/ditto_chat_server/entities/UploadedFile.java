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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "uploaded_file")
public class UploadedFile {
    @Id
    @JdbcType(VarcharJdbcType.class)
    @Column(name = "id", length = 36)
    private UUID id;

    @Column(name = "file_name", nullable = false, unique = false, length = 128)
    private String fileName;

    @Column(name = "file_type", nullable = false, unique = false)
    private short fileType;

    @Column(name = "uploaded_at", nullable = false, unique = false)
    private Timestamp uploadedAt;

    @Column(name = "s3_object_key", nullable = false, unique = true, length = 256)
    private String s3ObjectKey;

    @Column(name = "s3_upload_event_id", nullable = false, unique = true, length = 64)
    private String s3UploadEventId;

    @Column(name = "s3_upload_event_time", nullable = false)
    private Timestamp s3UploadEventTime;
    
	@OneToOne(fetch = FetchType.EAGER, cascade = {CascadeType.DETACH, CascadeType.REFRESH}, optional = false)
	@JoinColumn(name = "upload_file_intent_id", referencedColumnName = "id", nullable = false, unique = true)
	private UploadFileIntent uploadFileIntent;

    public UploadedFile() {}

    public UploadedFile(UUID id, Timestamp uploadedAt, String s3UploadEventId, Timestamp s3UploadEventTime, UploadFileIntent uploadFileIntent) {
        this.id = id;
        this.fileName = uploadFileIntent.getFileName();
        this.fileType = uploadFileIntent.getFileType();
        this.uploadedAt = uploadedAt;
        this.s3ObjectKey = uploadFileIntent.getS3ObjectKey();
        this.s3UploadEventId = s3UploadEventId;
        this.s3UploadEventTime = s3UploadEventTime;
        this.uploadFileIntent = uploadFileIntent;
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

    public Timestamp getUploadedAt() {
        return uploadedAt;
    }

    public String getS3ObjectKey() {
        return s3ObjectKey;
    }

    public String getS3UploadEventId() {
        return s3UploadEventId;
    }

    public Timestamp getS3UploadEventTime() {
        return s3UploadEventTime;
    }

    public UploadFileIntent getUploadFileIntent() {
        return uploadFileIntent;
    }
}
