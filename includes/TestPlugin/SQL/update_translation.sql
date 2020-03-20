#Uses placeholder for values

UPDATE {table_prefix}{table_name}_translations
SET lastModified=now(), lastUserModified=?, {translated_fields}
WHERE {where_clause};