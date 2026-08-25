CREATE TABLE `upload_file_intent` (
    `id` varchar(36),
    `file_name` varchar(128) NOT NULL,
    `file_type` smallint NOT NULL,
    `file_size_in_bytes` int NOT NULL,
    `file_purpose` smallint NOT NULL,
    `s3_object_key` varchar(256) NOT NULL,
    `s3_pre_signed_url_expires_at` datetime(6) NOT NULL,
    `created_at` datetime(6) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `upload_file_intent_s3_object_key_unique` (`s3_object_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `uploaded_file`
    ADD COLUMN `s3_object_key` varchar(256) NOT NULL,
    ADD COLUMN `s3_upload_event_id` varchar(64) NOT NULL,
    ADD COLUMN `s3_upload_event_time` datetime(6) NOT NULL,
    ADD COLUMN `upload_file_intent_id` varchar(36) NOT NULL,
    ADD UNIQUE KEY `s3_object_key_unique` (`s3_object_key`),
    ADD UNIQUE KEY `s3_upload_event_id_unique` (`s3_upload_event_id`),
    ADD UNIQUE KEY `uploaded_file_upload_file_intent_fk` (`upload_file_intent_id`),
    ADD CONSTRAINT FOREIGN KEY (`upload_file_intent_id`) REFERENCES `upload_file_intent` (`id`);
