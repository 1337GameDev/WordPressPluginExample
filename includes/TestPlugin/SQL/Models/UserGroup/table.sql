CREATE TABLE IF NOT EXISTS {table_prefix}UserGroups (
         `lastModified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
         `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
         `lastUserModified` mediumint(9) NOT NULL DEFAULT 0,
         `id` mediumint(9) NOT NULL AUTO_INCREMENT,
         `groupname` varchar(128) DEFAULT '' NOT NULL,
         PRIMARY KEY (`id`),
         UNIQUE KEY `id` (`id`),
         UNIQUE KEY `groupname` (`groupname`),
         FULLTEXT KEY `full_groupname` (`groupname`)
) ENGINE=InnoDB;

