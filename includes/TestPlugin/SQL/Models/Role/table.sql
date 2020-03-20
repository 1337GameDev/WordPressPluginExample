CREATE TABLE IF NOT EXISTS {table_prefix}Roles (
         `lastModified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
         `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
         `lastUserModified` mediumint(9) NULL DEFAULT 0,
         `id` mediumint(9) NOT NULL AUTO_INCREMENT,
         `rolename` varchar(64) DEFAULT '' NOT NULL,
         `description` varchar(256) DEFAULT '' NOT NULL,
         PRIMARY KEY (`id`),
         UNIQUE KEY `id` (`id`),
         UNIQUE KEY `rolename` (`rolename`),
         FULLTEXT KEY `full_rolename` (`rolename`)
) ENGINE=InnoDB;

