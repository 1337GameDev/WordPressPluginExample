CREATE TABLE IF NOT EXISTS {table_prefix}Languages (
         `lastModified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
         `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
         `lastUserModified` mediumint(9) NULL DEFAULT 0,
         `id` mediumint(9) NOT NULL AUTO_INCREMENT,
         `languagename` varchar(64) DEFAULT '' NOT NULL,
         `languagefamily` varchar(64) DEFAULT '' NOT NULL,
         `iso639_1` varchar(2) DEFAULT '' NOT NULL,
         `iso639_2` varchar(3) DEFAULT '' NOT NULL,

         PRIMARY KEY (`id`),
         UNIQUE KEY `id` (`id`),
         UNIQUE KEY `languagename` (`languagename`),
         UNIQUE KEY `iso639_1` (`iso639_1`),
         UNIQUE KEY `iso639_2` (`iso639_2`),
         FULLTEXT KEY `full_language_languagename` (`languagename`),
         FULLTEXT KEY `full_language_languagefamily` (`languagefamily`),
         FULLTEXT KEY `full_language_iso639_1` (`iso639_1`),
         FULLTEXT KEY `full_language_iso639_2` (`iso639_2`)
) ENGINE=InnoDB;

