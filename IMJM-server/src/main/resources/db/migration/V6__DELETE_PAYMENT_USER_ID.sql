ALTER TABLE payment
DROP CONSTRAINT payment_user_id_fkey;

ALTER TABLE payment
DROP CONSTRAINT payment_pkey;

ALTER TABLE payment
DROP COLUMN user_id;

ALTER TABLE payment
    ADD PRIMARY KEY (reservation_id);