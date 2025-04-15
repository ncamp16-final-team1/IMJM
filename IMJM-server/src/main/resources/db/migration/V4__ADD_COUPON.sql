CREATE TABLE coupon (
                        id BIGSERIAL PRIMARY KEY,
                        salon_id VARCHAR(20) NOT NULL,
                        name VARCHAR(100) NOT NULL,
                        discount_type VARCHAR(20) NOT NULL, -- 할인 유형 ('percentage' 또는 'fixed')
                        discount_value INT NOT NULL,
                        minimum_purchase INT DEFAULT 0,
                        start_date TIMESTAMP NOT NULL,
                        expiry_date TIMESTAMP NOT NULL,
                        is_active BOOLEAN DEFAULT TRUE,
                        max_uses INT DEFAULT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (salon_id) REFERENCES salon(id) ON DELETE CASCADE
);

CREATE TABLE reservation_coupon (
                                    id BIGSERIAL PRIMARY KEY,
                                    reservation_id BIGINT NOT NULL,
                                    coupon_id BIGINT NOT NULL,
                                    discount_amount INT NOT NULL,
                                    FOREIGN KEY (reservation_id) REFERENCES reservation(id),
                                    FOREIGN KEY (coupon_id) REFERENCES coupon(id) ON DELETE CASCADE,
                                    CONSTRAINT unique_chat UNIQUE  (reservation_id, coupon_id)
);