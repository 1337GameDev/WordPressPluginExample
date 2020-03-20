CREATE TABLE IF NOT EXISTS {table_prefix}Users (
         `lastModified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
         `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
         `lastUserModified` mediumint(9) NOT NULL DEFAULT 0,
         `id` mediumint(9) NOT NULL AUTO_INCREMENT,
         `username` varchar(256) DEFAULT '' NOT NULL,
         `role` mediumint(9) NOT NULL,
         `firstname` varchar(256) DEFAULT '' NOT NULL,
         `lastname` varchar(256) DEFAULT '' NOT NULL,
         PRIMARY KEY (`id`),
         KEY `lastUserModified` (`lastUserModified`),
         KEY `role` (`role`),
         UNIQUE KEY `id` (`id`),
         UNIQUE KEY `username` (`username`),
         FULLTEXT KEY `full_username` (`username`),
         CONSTRAINT `fk_users_to_roles` FOREIGN KEY (`role`) REFERENCES `{table_prefix}Roles` (`id`)
) ENGINE=InnoDB;

