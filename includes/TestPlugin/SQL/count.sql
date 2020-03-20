#Uses placeholder for values

SELECT COUNT(*) as 'count',`id` FROM {table_prefix}{table_name}{where_clause} GROUP BY `id`;