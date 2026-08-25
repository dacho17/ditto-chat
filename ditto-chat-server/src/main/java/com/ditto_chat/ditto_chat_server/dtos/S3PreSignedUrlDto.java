package com.ditto_chat.ditto_chat_server.dtos;

import java.sql.Timestamp;

public class S3PreSignedUrlDto {
    private String s3ObjectKey;
    private String url;
    private Timestamp expiresAt;

    public S3PreSignedUrlDto(String s3ObjectKey, String url, Timestamp expiresAt) {
        this.s3ObjectKey = s3ObjectKey;
        this.url = url;
        this.expiresAt = expiresAt;
    }

    public String getS3ObjectKey() {
        return s3ObjectKey;
    }

    public String getUrl() {
        return url;
    }

    public Timestamp getExpiresAt() {
        return expiresAt;
    }
}
