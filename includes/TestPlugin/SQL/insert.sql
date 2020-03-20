#Uses placeholder for values

INSERT INTO {table_prefix}{table_name} (lastModified, created, lastUserModified, {model_properties})
VALUES (now(), now(), {placeholders});