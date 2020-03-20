#Uses placeholder for values

UPDATE {table_prefix}{table_name}
SET lastModified=now(), lastUserModified=?, {model_properties}
WHERE {where_clause};