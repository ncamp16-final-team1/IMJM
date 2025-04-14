CREATE TABLE chat_photos (
    photo_id BIGSERIAL,
    chat_message_id BIGINT NOT NULL,
    photo_url VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (photo_id),
    FOREIGN KEY (chat_message_id) REFERENCES chat_message(id) ON DELETE CASCADE
);