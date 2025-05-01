CREATE TABLE review_reply (
                              id BIGSERIAL PRIMARY KEY,
                              review_id BIGINT NOT NULL,
                              content TEXT NOT NULL,
                              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                              FOREIGN KEY (review_id) REFERENCES review(id) ON DELETE CASCADE
);

ALTER TABLE review
ALTER COLUMN review_tag TYPE VARCHAR(255);