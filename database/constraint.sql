ALTER TABLE my_cons_elec.user
    ADD CONSTRAINT fk_user_token_uid FOREIGN KEY (user_token_uid) REFERENCES my_cons_elec.user_token (uid);
ALTER TABLE my_cons_elec.electric_consumption
    ADD CONSTRAINT fk_user_uid FOREIGN KEY (user_uid) REFERENCES my_cons_elec.user (uid);