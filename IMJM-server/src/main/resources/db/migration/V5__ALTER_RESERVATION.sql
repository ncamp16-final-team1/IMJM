ALTER TABLE reservation
    RENAME COLUMN service_type TO reservation_service_type;

ALTER TABLE reservation
    RENAME COLUMN service_name TO reservation_service_name;

ALTER TABLE reservation
    RENAME COLUMN price TO reservation_price;

ALTER TABLE reservation
    ADD COLUMN service_menu_id BIGINT NOT NULL;

ALTER TABLE reservation
    ADD CONSTRAINT fk_service_menu_id
        FOREIGN KEY (service_menu_id) REFERENCES service_menu(id);