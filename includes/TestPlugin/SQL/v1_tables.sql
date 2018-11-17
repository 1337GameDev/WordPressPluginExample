# Creates 2 tables, the 2nd with a FK
# Also creates a FK constraint

CREATE TABLE {table_prefix}table1 (
         id mediumint(9) NOT NULL AUTO_INCREMENT,
         added datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
         modified datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
         field1 varchar(256) DEFAULT '' NOT NULL,
         PRIMARY KEY  (id)
       ) ENGINE=InnoDB {db_collate};

CREATE TABLE {table_prefix}table2 (
         id mediumint(9) NOT NULL AUTO_INCREMENT,
         added datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
         modified datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
         field1 varchar(256) DEFAULT '' NOT NULL,
         tbl2_fk_id mediumint(9) NOT NULL,
         PRIMARY KEY  (id)
) ENGINE=InnoDB {db_collate};

ALTER TABLE {table_prefix}table2
ADD CONSTRAINT fk_{table_prefix}table2_{table_prefix}table1
FOREIGN KEY (tbl2_fk_id)
REFERENCES {table_prefix}table1(id)
ON DELETE CASCADE;

