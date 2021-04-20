DROP SCHEMA IF EXISTS my_cons_elec CASCADE;
CREATE SCHEMA IF NOT EXISTS my_cons_elec;

DROP TABLE IF EXISTS my_cons_elec.user_token CASCADE;
CREATE TABLE my_cons_elec.user_token
(
    uid           SERIAL       NOT NULL,
    token_string  VARCHAR(255) NOT NULL,
    validity_date TIMESTAMPTZ,
    is_used       BOOLEAN      NOT NULL DEFAULT FALSE,
    use_date      TIMESTAMPTZ,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_by    VARCHAR(255) NOT NULL,
    updated_at    TIMESTAMPTZ,
    updated_by    VARCHAR(255),
    CONSTRAINT pk_user_token PRIMARY KEY (uid),
    CONSTRAINT ui1_user_token UNIQUE (token_string)
);

DROP TABLE IF EXISTS my_cons_elec.user CASCADE;
CREATE TABLE IF NOT EXISTS my_cons_elec.user
(
    uid               SERIAL       NOT NULL,
    first_name        VARCHAR(255) NOT NULL,
    last_name         VARCHAR(255) NOT NULL,
    unique_identifier VARCHAR(255) NOT NULL,
    email             VARCHAR(255) NOT NULL,
    password          VARCHAR(255) NOT NULL,
    user_token_uid    INTEGER      NOT NULL, --FK
    is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
    is_admin          BOOLEAN      NOT NULL DEFAULT FALSE,
    can_invite        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_by        VARCHAR(255) NOT NULL,
    updated_at        TIMESTAMPTZ,
    updated_by        VARCHAR(255),
    CONSTRAINT pk_user PRIMARY KEY (uid),
    CONSTRAINT ui1_user UNIQUE (unique_identifier),
    CONSTRAINT ui2_user UNIQUE (email),
    CONSTRAINT ui3_user UNIQUE (user_token_uid)
);

DROP TABLE IF EXISTS my_cons_elec.electric_consumption CASCADE;
CREATE TABLE IF NOT EXISTS my_cons_elec.electric_consumption
(
    uid          SERIAL        NOT NULL,
    user_uid     INTEGER       NOT NULL, --FK
    record_date  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    record_value NUMERIC(9, 1) NOT NULL,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    created_by   VARCHAR(255)  NOT NULL,
    updated_at   TIMESTAMPTZ,
    updated_by   VARCHAR(255),
    CONSTRAINT pk_electric_consumption PRIMARY KEY (uid),
    CONSTRAINT ui1_electric_consumption UNIQUE (user_uid, record_date)
);
DROP TABLE IF EXISTS my_cons_elec.parameter CASCADE;
CREATE TABLE IF NOT EXISTS my_cons_elec.parameter
(
    key   VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    CONSTRAINT pk_parameter PRIMARY KEY (key)
)