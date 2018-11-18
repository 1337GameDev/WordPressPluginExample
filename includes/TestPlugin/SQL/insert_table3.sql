#Uses placeholder for values

INSERT INTO {table_prefix}table3
    ( tblField, added, modified )
    VALUES ( %s, %d, now(), now() );