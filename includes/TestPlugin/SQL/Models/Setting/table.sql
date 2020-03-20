CREATE TABLE IF NOT EXISTS {table_prefix}Settings (
         `lastModified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
         `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
         `lastUserModified` mediumint(9) NOT NULL DEFAULT 0,
         `id` mediumint(9) NOT NULL AUTO_INCREMENT,
         `settingname` varchar(128) DEFAULT '' NOT NULL,
         `settingvalue` varchar(512) DEFAULT '' NOT NULL,
         PRIMARY KEY (`id`),
         KEY `lastUserModified` (`lastUserModified`),
         UNIQUE KEY `id` (`id`),
         UNIQUE KEY `settingname` (`settingname`),
         FULLTEXT KEY `full_settingname` (`settingname`)
) ENGINE=InnoDB;

