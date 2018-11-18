ALTER TABLE {table_prefix}table2
ADD CONSTRAINT fk_{table_prefix}table2_{table_prefix}table1
FOREIGN KEY (tbl2_fk_id)
REFERENCES {table_prefix}table1(id)
ON DELETE CASCADE;