CREATE OR REPLACE FUNCTION my_cons_elec.format_user_date() RETURNS TRIGGER AS
$$
DECLARE
    v_first_name         VARCHAR;
    v_last_name          VARCHAR;
    v_unique_identifier  VARCHAR;
    v_lst_idx            INTEGER := 1;
    v_first_name_max_idx INTEGER;
    v_exist              BOOLEAN := FALSE;
BEGIN
    IF new.is_active THEN
        IF new.unique_identifier IS NULL THEN
            IF POSITION(' ' IN new.last_name) > 0 THEN
                v_last_name = SUBSTR(new.last_name, 1, POSITION(' ' IN new.last_name));
            ELSE
                v_last_name = new.last_name;
            END IF;
            IF POSITION(' ' IN new.first_name) > 0 THEN
                v_first_name_max_idx = POSITION(' ' IN new.first_name) - 1;
            ELSE
                v_first_name_max_idx = LENGTH(new.first_name);
            END IF;
            LOOP
                EXIT WHEN v_lst_idx > v_first_name_max_idx;
                v_first_name = SUBSTR(new.first_name, 1, v_lst_idx);
                SELECT EXISTS(SELECT *
                              FROM my_cons_elec.user
                              WHERE unique_identifier =
                                    UPPER(v_first_name || v_last_name))
                INTO v_exist;
                IF NOT v_exist THEN
                    v_unique_identifier = UPPER(v_first_name || v_last_name);
                    EXIT;
                ELSE
                    v_lst_idx = v_lst_idx + 1;
                END IF;
            END LOOP;
            IF (v_unique_identifier IS NULL) THEN
                RAISE EXCEPTION 'impossible de générer un identifiant unique pour % % à l''aide de son prénom et de son nom',UPPER(new.last_name),INITCAP(new.first_name);
            END IF;
            new.unique_identifier = v_unique_identifier;
        END IF;
        new.first_name = INITCAP(LOWER(new.first_name));
        new.last_name = UPPER(new.last_name);
        IF new.email IS NOT NULL THEN
            new.email = LOWER(new.email);
        END IF;
    END IF;
    RETURN new;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_format_data
    BEFORE INSERT OR UPDATE
    ON my_cons_elec.user
    FOR EACH ROW
EXECUTE PROCEDURE my_cons_elec.format_user_date();

CREATE OR REPLACE FUNCTION my_cons_elec.ck_value_created_by() RETURNS TRIGGER AS
$$
DECLARE
    user_exist BOOLEAN;
BEGIN
    IF (new.created_by != 'SYS_ADM') THEN
        SELECT EXISTS(SELECT * FROM my_cons_elec.user WHERE unique_identifier = new.created_by)
        INTO user_exist;
        IF (NOT user_exist) THEN
            RAISE EXCEPTION 'unique identifier % for column created_by in table %.% is not allowed',new.created_by,tg_table_schema,tg_table_name;
        END IF;
    END IF;
    RETURN new;
END
$$ LANGUAGE plpgsql;

DO
$$
    DECLARE
        curs_tables_to_add_constraint CURSOR FOR SELECT table_schema, table_name, column_name
                                                 FROM information_schema.columns
                                                 WHERE table_schema = 'my_cons_elec'
                                                   AND column_name = 'created_by'
                                                 ORDER BY 1, 2;
        v_table_to_add_constraint RECORD;
    BEGIN
        OPEN curs_tables_to_add_constraint;
        LOOP
            FETCH curs_tables_to_add_constraint INTO v_table_to_add_constraint;
            EXIT WHEN NOT found;
            EXECUTE FORMAT('CREATE TRIGGER %s_%s BEFORE INSERT OR UPDATE ON %s.%s FOR EACH ROW EXECUTE PROCEDURE %s.%s',
                           v_table_to_add_constraint.table_name, v_table_to_add_constraint.column_name,
                           v_table_to_add_constraint.table_schema, v_table_to_add_constraint.table_name, 'my_cons_elec',
                           'ck_value_created_by()');
        END LOOP;
        CLOSE curs_tables_to_add_constraint;
    END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION my_cons_elec.ck_value_updated_by() RETURNS TRIGGER AS
$$
DECLARE
    user_exist BOOLEAN;
BEGIN
    IF (new.updated_by != 'SYS_ADM') THEN
        SELECT EXISTS(SELECT * FROM my_cons_elec.user WHERE unique_identifier = new.updated_by)
        INTO user_exist;
        IF (NOT user_exist) THEN
            RAISE EXCEPTION 'unique identifier % for column updated_by in table %.% is not allowed',new.updated_by,tg_table_schema,tg_table_name;
        END IF;
    END IF;
    if(new.updated_by is null) then
        RAISE EXCEPTION  'updated_at column for line : ''%'' must be define when performing an update on a record ',new.uid;
    END IF;
    RETURN new;
END
$$ LANGUAGE plpgsql;

DO
$$
    DECLARE
        curs_tables_to_add_constraint CURSOR FOR SELECT table_schema, table_name, column_name
                                                 FROM information_schema.columns
                                                 WHERE table_schema = 'my_cons_elec'
                                                   AND column_name = 'updated_by'
                                                 ORDER BY 1, 2;
        v_table_to_add_constraint RECORD;
    BEGIN
        OPEN curs_tables_to_add_constraint;
        LOOP
            FETCH curs_tables_to_add_constraint INTO v_table_to_add_constraint;
            EXIT WHEN NOT found;
            EXECUTE FORMAT('CREATE TRIGGER %s_%s BEFORE UPDATE ON %s.%s FOR EACH ROW EXECUTE PROCEDURE %s.%s',
                           v_table_to_add_constraint.table_name, v_table_to_add_constraint.column_name,
                           v_table_to_add_constraint.table_schema, v_table_to_add_constraint.table_name, 'my_cons_elec',
                           'ck_value_updated_by()');
        END LOOP;
        CLOSE curs_tables_to_add_constraint;
    END
$$ LANGUAGE plpgsql;