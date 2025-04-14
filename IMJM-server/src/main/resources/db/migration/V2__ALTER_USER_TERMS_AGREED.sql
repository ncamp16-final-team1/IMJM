ALTER TABLE users
    ADD COLUMN terms_agreed BOOLEAN DEFAULT false;

ALTER TABLE salon
    ADD COLUMN detail_address VARCHAR(255);