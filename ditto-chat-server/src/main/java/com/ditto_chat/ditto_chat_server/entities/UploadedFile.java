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
    
    public UploadedFile(UUID id, String fileName, short fileType, Timestamp uploadedAt) {
        this.id = id;
        this.fileName = fileName;
        this.fileType = fileType;
        this.uploadedAt = uploadedAt;
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
}
