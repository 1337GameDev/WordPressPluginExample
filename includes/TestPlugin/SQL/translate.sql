#Uses placeholder for values

SELECT {model_fields}
FROM {table_prefix}{table_name}_translations as transTbl
LEFT JOIN {table_prefix}Languages AS langTbl ON langTbl.`id` = transTbl.`destinationlanguageid`
WHERE {where_clause};