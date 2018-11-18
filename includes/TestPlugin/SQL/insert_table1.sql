#Uses placeholder for values

INSERT INTO {table_prefix}table1
    ( field1, added, modified )
VALUES ( %s, now(), now() );