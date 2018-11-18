#Uses placeholder for values

INSERT INTO {table_prefix}table1
    ( field1, added, modified )
VALUES ( 'field1 value', now(), now() );

INSERT INTO {table_prefix}table2
    ( field1,tbl2_fk_id, added, modified )
    VALUES ( 'field1 value 2', 1, now(), now() );

