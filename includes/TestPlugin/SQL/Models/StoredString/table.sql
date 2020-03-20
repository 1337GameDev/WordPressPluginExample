CREATE TABLE IF NOT EXISTS {table_prefix}StoredStrings (
         `lastModified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
         `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
         `lastUserModified` mediumint(9) NOT NULL DEFAULT 0,
         `id` mediumint(9) NOT NULL AUTO_INCREMENT,
         `storedtext` varchar(512) DEFAULT '' NOT NULL,
         PRIMARY KEY (`id`),
         KEY `lastUserModified` (`lastUserModified`),
         UNIQUE KEY `id` (`id`),
         UNIQUE KEY `storedtext` (`storedtext`),
         FULLTEXT KEY `full_storedtext` (`storedtext`)
) ENGINE=InnoDB;

