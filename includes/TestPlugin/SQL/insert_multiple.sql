#Uses placeholder for values

INSERT IGNORE INTO {table_prefix}{table_name} (lastModified, created, {model_properties})
VALUES {placeholders};