#Uses placeholder for values

DELETE FROM {table_prefix}{table_name}_translations
WHERE `translatedrecordid`=? AND `destinationlanguageid`=(SELECT `id` FROM {table_prefix}Languages AS langTbl WHERE langTbl.`iso639_1` = ?);