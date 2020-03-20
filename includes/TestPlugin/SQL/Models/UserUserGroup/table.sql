CREATE TABLE IF NOT EXISTS {table_prefix}UserUserGroups (
        `lastModified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `lastUserModified` mediumint(9) NULL DEFAULT 0,
        `id` mediumint(9) NOT NULL AUTO_INCREMENT,
        `usergroup` mediumint(9) NULL DEFAULT 1,
        `userid` mediumint(9) NULL DEFAULT 1,
        PRIMARY KEY (`id`),
        UNIQUE KEY `id` (`id`),
        UNIQUE KEY `unique_user_usergroups` (`usergroup`,`userid`),
        CONSTRAINT `fk_userusergroups_to_users` FOREIGN KEY (`userid`) REFERENCES `{table_prefix}Users` (`id`) ON DELETE CASCADE,
        CONSTRAINT `fk_userusergroups_to_usergroups` FOREIGN KEY (`usergroup`) REFERENCES `{table_prefix}UserGroups` (`id`)
) ENGINE=InnoDB;

