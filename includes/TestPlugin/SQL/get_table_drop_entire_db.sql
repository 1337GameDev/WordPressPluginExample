SELECT CONCAT( 'DROP TABLE IF EXISTS', GROUP_CONCAT(table_name) , ';' )
           AS statement FROM information_schema.tables
WHERE table_name LIKE ?;