# Creates 2 tables, the 2nd with a FK
# Also creates a FK constraint

CREATE TABLE {table_prefix}table3 (
         id mediumint(9) NOT NULL AUTO_INCREMENT,
         added datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
         modified datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
         tblField varchar(256) DEFAULT '' NOT NULL,
         PRIMARY KEY  (id)
       ) ENGINE=InnoDB {db_collate};

