CREATE TABLE IF NOT EXISTS {table_prefix}_Languages_translations (
         `lastModified` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
         `created` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
         `lastUserModified` mediumint(9) NULL DEFAULT 0,
         `id` mediumint(9) NOT NULL AUTO_INCREMENT,
         # The translated record
         `translatedrecordid` mediumint(9) NOT NULL AUTO_INCREMENT,
         `languagename` varchar(64) DEFAULT '' NOT NULL,

         # The language this translation is in
         `destinationlanguageid` mediumint(9) NOT NULL AUTO_INCREMENT,

         PRIMARY KEY (`id`),
         UNIQUE KEY `trans_and_dest_unique` (`translatedrecordid`, `destinationlanguageid`),
         FULLTEXT KEY `full_language_languagename` (`languagename`)
) ENGINE=InnoDB;

