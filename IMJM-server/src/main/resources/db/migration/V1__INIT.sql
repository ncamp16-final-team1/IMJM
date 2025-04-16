CREATE TABLE users (
                       id VARCHAR(100),
                       user_type VARCHAR(20),
                       first_name VARCHAR(50),
                       last_name VARCHAR(20),
                       language VARCHAR(20),
                       email VARCHAR(50),
                       gender VARCHAR(20),
                       nickname VARCHAR(50),
                       profile VARCHAR(255),
                       birthday DATE,
                       region VARCHAR(15),
                       point INT DEFAULT 0,
                       is_notification BOOLEAN DEFAULT true,
                       address VARCHAR(255),
                       latitude DECIMAL(10, 8),
                       longitude DECIMAL(11, 8),
                       PRIMARY KEY (id),
                       CONSTRAINT unique_email UNIQUE (email),
                       CONSTRAINT unique_nickname UNIQUE (nickname)
);

CREATE TABLE member (
                        user_id VARCHAR(100),
                        history VARCHAR(50),
                        washing_hair VARCHAR(20),
                        PRIMARY KEY (user_id),
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE client_stylist (
                                user_id VARCHAR(100),
                                salon_name VARCHAR(50),
                                license VARCHAR(255),
                                PRIMARY KEY (user_id),
                                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE salon (
                       id VARCHAR(20) NOT NULL,
                       password VARCHAR(100) NOT NULL,
                       name VARCHAR(50) NOT NULL,
                       corp_reg_number VARCHAR(20),
                       address VARCHAR(255),
                       call_number VARCHAR(20),
                       introduction TEXT,
                       holiday_mask SMALLINT NOT NULL DEFAULT 0,
                       start_time TIME,
                       end_time TIME,
                       time_unit INT,
                       score DECIMAL(2, 1),
                       latitude DECIMAL(10, 8),
                       longitude DECIMAL(11, 8),
                       PRIMARY KEY (id)
);

CREATE TABLE salon_photos (
                              photo_id BIGSERIAL,
                              salon_id VARCHAR(20) NOT NULL,
                              photo_url VARCHAR(255) NOT NULL,
                              photo_order INT NOT NULL,
                              upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              PRIMARY KEY (photo_id),
                              FOREIGN KEY (salon_id) REFERENCES salon(id) ON DELETE CASCADE
);

CREATE TABLE service_menu (
                              id BIGSERIAL,
                              salon_id VARCHAR(20) NOT NULL,
                              service_type VARCHAR(100) NOT NULL,
                              service_name VARCHAR(100) NOT NULL,
                              service_description TEXT,
                              price INT NOT NULL,
                              PRIMARY KEY (id),
                              FOREIGN KEY (salon_id) REFERENCES salon(id) ON DELETE CASCADE
);

CREATE TABLE admin_stylist (
                               stylist_id BIGSERIAL NOT NULL,
                               salon_id VARCHAR(20) NOT NULL,
                               name VARCHAR(10) NOT NULL,
                               call_number VARCHAR(20),
                               start_time TIME,
                               end_time TIME,
                               holiday_mask SMALLINT NOT NULL DEFAULT 0,
                               profile VARCHAR(255),
                               introduction TEXT,
                               PRIMARY KEY (stylist_id),
                               FOREIGN KEY (salon_id) REFERENCES salon(id) ON DELETE CASCADE
);

CREATE TABLE reservation (
                             id BIGSERIAL NOT NULL,
                             user_id VARCHAR(100) NOT NULL,
                             stylist_id BIGINT NOT NULL,
                             reservation_date DATE NOT NULL,
                             reservation_time TIME NOT NULL,
                             service_type VARCHAR(100) NOT NULL,
                             service_name VARCHAR(100) NOT NULL,
                             price INT NOT NULL,
                             is_paid BOOLEAN NOT NULL,
                             requirements TEXT,
                             PRIMARY KEY (id),
                             FOREIGN KEY (user_id) REFERENCES users(id),
                             FOREIGN KEY (stylist_id) REFERENCES admin_stylist(stylist_id),
                             CONSTRAINT unique_reservation UNIQUE (stylist_id, reservation_date, reservation_time)
);

CREATE TABLE review (
                        id BIGSERIAL NOT NULL,
                        user_id VARCHAR(100) NOT NULL,
                        salon_id VARCHAR(20) NOT NULL,
                        reg_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        score DECIMAL(2, 1) NOT NULL,
                        content TEXT,
                        review_tag VARCHAR(100),
                        reservation_id BIGINT,
                        PRIMARY KEY (id),
                        FOREIGN KEY (user_id) REFERENCES users(id),
                        FOREIGN KEY (salon_id) REFERENCES salon(id),
                        FOREIGN KEY (reservation_id) REFERENCES reservation(id)
);

CREATE TABLE review_photos (
                               photo_id BIGSERIAL,
                               review_id BIGINT NOT NULL,
                               photo_url VARCHAR(255) NOT NULL,
                               photo_order INT NOT NULL,
                               upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                               PRIMARY KEY (photo_id),
                               FOREIGN KEY (review_id) REFERENCES review(id) ON DELETE CASCADE
);

CREATE TABLE point_usage (
                             id BIGSERIAL NOT NULL,
                             user_id VARCHAR(100) NOT NULL,
                             usage_type VARCHAR(20) NOT NULL,
                             price INT NOT NULL,
                             use_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             content VARCHAR(100) NOT NULL,
                             PRIMARY KEY (id),
                             FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE archive (
                         id BIGSERIAL NOT NULL,
                         user_id VARCHAR(100) NOT NULL,
                         content TEXT,
                         service VARCHAR(50),
                         gender VARCHAR(10),
                         color VARCHAR(50),
                         length VARCHAR(50),
                         reg_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         PRIMARY KEY (id),
                         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE archive_photos (
                                photo_id BIGSERIAL,
                                archive_id BIGINT NOT NULL,
                                photo_url VARCHAR(255) NOT NULL,
                                photo_order INT NOT NULL,
                                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                PRIMARY KEY (photo_id),
                                FOREIGN KEY (archive_id) REFERENCES archive(id) ON DELETE CASCADE
);

CREATE TABLE archive_like (
                              archive_id BIGINT NOT NULL,
                              user_id VARCHAR(100) NOT NULL,
                              PRIMARY KEY (archive_id, user_id),
                              FOREIGN KEY (archive_id) REFERENCES archive(id) ON DELETE CASCADE,
                              FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE archive_comment (
                                 id BIGSERIAL NOT NULL,
                                 archive_id BIGINT NOT NULL,
                                 user_id VARCHAR(100) NOT NULL,
                                 reg_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 content TEXT,
                                 is_comment_for_comment BOOLEAN NOT NULL DEFAULT FALSE,
                                 parent_comment_id BIGINT,
                                 PRIMARY KEY (id),
                                 FOREIGN KEY (archive_id) REFERENCES archive(id) ON DELETE CASCADE,
                                 FOREIGN KEY (user_id) REFERENCES users(id)
);

ALTER TABLE archive_comment ADD FOREIGN KEY (parent_comment_id) REFERENCES archive_comment(id);

CREATE TABLE community (
                           id BIGSERIAL NOT NULL,
                           user_id VARCHAR(100) NOT NULL,
                           title VARCHAR(100) NOT NULL,
                           content TEXT NOT NULL,
                           reg_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           PRIMARY KEY (id),
                           FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE community_photos (
                                  photo_id BIGSERIAL,
                                  community_id BIGINT NOT NULL,
                                  photo_url VARCHAR(255) NOT NULL,
                                  photo_order INT NOT NULL,
                                  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                  PRIMARY KEY (photo_id),
                                  FOREIGN KEY (community_id) REFERENCES community(id) ON DELETE CASCADE
);

CREATE TABLE community_like (
                                community_id BIGINT NOT NULL,
                                user_id VARCHAR(100) NOT NULL,
                                PRIMARY KEY (community_id, user_id),
                                FOREIGN KEY (community_id) REFERENCES community(id) ON DELETE CASCADE,
                                FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE community_comment (
                                   id BIGSERIAL NOT NULL,
                                   community_id BIGINT NOT NULL,
                                   user_id VARCHAR(100) NOT NULL,
                                   reg_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   content TEXT,
                                   is_comment_for_comment BOOLEAN NOT NULL DEFAULT FALSE,
                                   parent_comment_id BIGINT,
                                   PRIMARY KEY (id),
                                   FOREIGN KEY (community_id) REFERENCES community(id) ON DELETE CASCADE,
                                   FOREIGN KEY (user_id) REFERENCES users(id)
);

ALTER TABLE community_comment ADD FOREIGN KEY (parent_comment_id) REFERENCES community_comment(id);

CREATE TABLE payment (
                         reservation_id BIGINT NOT NULL,
                         user_id VARCHAR(100) NOT NULL,
                         price INT NOT NULL,
                         payment_method VARCHAR(50) NOT NULL,
                         payment_status VARCHAR(20) NOT NULL,
                         transaction_id VARCHAR(100),
                         payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         is_canceled BOOLEAN DEFAULT FALSE,
                         canceled_amount DECIMAL(10, 2) DEFAULT 0.00,
                         canceled_at TIMESTAMP NULL,
                         is_refunded BOOLEAN DEFAULT FALSE,
                         FOREIGN KEY (reservation_id) REFERENCES reservation(id),
                         FOREIGN KEY (user_id) REFERENCES users(id),
                         PRIMARY KEY (reservation_id, user_id)
);

CREATE TABLE alarm (
                       id BIGSERIAL,
                       user_id VARCHAR(100) NOT NULL,
                       title VARCHAR(100) NOT NULL,
                       content TEXT NOT NULL,
                       is_read BOOLEAN DEFAULT FALSE,
                       notification_type VARCHAR(50),
                       reference_id BIGINT,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       PRIMARY KEY (id),
                       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE chat_room (
                           id BIGSERIAL,
                           user_id VARCHAR(100) NOT NULL,
                           salon_id VARCHAR(20) NOT NULL,
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           last_message_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           PRIMARY KEY (id),
                           FOREIGN KEY (user_id) REFERENCES users(id),
                           FOREIGN KEY (salon_id) REFERENCES salon(id),
                           CONSTRAINT unique_chat UNIQUE (user_id, salon_id)
);

CREATE TABLE chat_message (
                              id BIGSERIAL,
                              chat_room_id BIGINT NOT NULL,
                              sender_type VARCHAR(20) NOT NULL,
                              message TEXT NOT NULL,
                              is_read BOOLEAN DEFAULT FALSE,
                              sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              translated_message TEXT,
                              translation_status VARCHAR(10) DEFAULT 'none',
                              PRIMARY KEY (id),
                              FOREIGN KEY (chat_room_id) REFERENCES chat_room(id) ON DELETE CASCADE
);

CREATE TABLE translation_cache (
                                   id BIGSERIAL,
                                   source_text TEXT NOT NULL,
                                   source_language VARCHAR(10) NOT NULL,
                                   target_language VARCHAR(10) NOT NULL,
                                   translated_text TEXT NOT NULL,
                                   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                   last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                   use_count INT DEFAULT 1,
                                   text_hash VARCHAR(64) NOT NULL,
                                   PRIMARY KEY (id),
                                   CONSTRAINT unique_translation UNIQUE (text_hash, source_language, target_language)
);

CREATE INDEX idx_last_used ON translation_cache (last_used_at);

CREATE TABLE blacklist (
                           salon_id VARCHAR(20) NOT NULL,
                           user_id VARCHAR(100) NOT NULL,
                           reason TEXT,
                           blocked_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           PRIMARY KEY (salon_id, user_id),
                           FOREIGN KEY (salon_id) REFERENCES salon(id) ON DELETE CASCADE,
                           FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);