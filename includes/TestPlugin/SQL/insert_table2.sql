#Uses placeholder for values

INSERT INTO {table_prefix}table2
    ( field1,tbl2_fk_id, added, modified )
    VALUES ( %s, %d, now(), now() );