#Uses placeholder for values

INSERT INTO {table_prefix}{table_name}_translations (lastModified, created, destinationlanguageid, lastUserModified, {translated_fields})
VALUES (now(), now(), (SELECT `id` FROM {table_prefix}Languages AS langTbl WHERE langTbl.`iso639_1` = ?), {placeholders});