-- Creating Tables with all Columns Defined, and without Foreign Key Constraints
CREATE TABLE `uploaded_file` (
    `id` varchar(36),
    `file_name` varchar(128) NOT NULL,
    `file_type` smallint NOT NULL,
    `uploaded_at` datetime(6) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `account_image` (
    `id` varchar(36),
    `replaced_at` datetime(6) DEFAULT NULL,
    `chatter_id` varchar(36) NOT NULL,
    `uploaded_file_id` varchar(36) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `account_image_uploaded_file_fk` (`uploaded_file_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `shared_file` (
    `id` varchar(36),
    `chat_thread_message_id` varchar(36) NOT NULL,
    `uploaded_file_id` varchar(36) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `shared_file_chat_thread_message_fk` (`chat_thread_message_id`),
    UNIQUE KEY `shared_file_uploaded_file_fk` (`uploaded_file_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `chat_thread_message` (
    `id` varchar(36),
    `message_content` varchar(2048) NOT NULL,
    `message_registered_at` datetime(6) NOT NULL,
    `sender_chat_thread_participant_id` varchar(36) NOT NULL,
    `chat_thread_id` varchar(36) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `chatter` (
    `id` varchar(36),
    `name` varchar(128) NOT NULL,
    `surname` varchar(128) NOT NULL,
    `username` varchar(128) NOT NULL,
    `email` varchar(128) NOT NULL,
    `password` varchar(128) NOT NULL,
    `created_at` datetime(6) NOT NULL,
    `last_login_at` datetime(6) DEFAULT NULL,
    `password_reset_token_hash` varchar(256) DEFAULT NULL,
    `password_reset_valid_until` datetime(6) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `chatter_email_unique` (`email`),
    UNIQUE KEY `chatter_username_unique` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `chat_thread` (
    `id` varchar(36),
    `created_at` datetime(6) NOT NULL,
    `last_chat_thread_message_id` varchar(36) DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `chat_thread_participant` (
    `id` varchar(36),
    `joined_chat_thread_at` datetime(6) NOT NULL,
    `cleared_chat_thread_history_at` datetime(6) DEFAULT NULL,
    `left_chat_thread_at` datetime(6) DEFAULT NULL,
    `chatter_id` varchar(36) NOT NULL,
    `chat_thread_id` varchar(36) NOT NULL,
    `last_seen_chat_thread_message_id` varchar(36) DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Creating Foreign Key Constraints
ALTER TABLE `account_image` 
    ADD CONSTRAINT FOREIGN KEY (`chatter_id`) REFERENCES `chatter` (`id`),
    ADD CONSTRAINT FOREIGN KEY (`uploaded_file_id`) REFERENCES `uploaded_file` (`id`);

ALTER TABLE `shared_file` 
    ADD CONSTRAINT FOREIGN KEY (`chat_thread_message_id`) REFERENCES `chat_thread_message` (`id`),
    ADD CONSTRAINT FOREIGN KEY (`uploaded_file_id`) REFERENCES `uploaded_file` (`id`);

ALTER TABLE `chat_thread_message` 
    ADD CONSTRAINT FOREIGN KEY (`sender_chat_thread_participant_id`) REFERENCES `chat_thread_participant` (`id`),
    ADD CONSTRAINT FOREIGN KEY (`chat_thread_id`) REFERENCES `chat_thread` (`id`);

ALTER TABLE `chat_thread` 
    ADD CONSTRAINT FOREIGN KEY (`last_chat_thread_message_id`) REFERENCES `chat_thread_message` (`id`);

ALTER TABLE `chat_thread_participant` 
    ADD CONSTRAINT FOREIGN KEY (`chatter_id`) REFERENCES `chatter` (`id`),
    ADD CONSTRAINT FOREIGN KEY (`chat_thread_id`) REFERENCES `chat_thread` (`id`),
    ADD CONSTRAINT FOREIGN KEY (`last_seen_chat_thread_message_id`) REFERENCES `chat_thread_message` (`id`);
