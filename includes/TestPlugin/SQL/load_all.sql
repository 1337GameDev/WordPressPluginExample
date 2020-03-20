#Uses placeholder for values

SELECT {model_fields},(SELECT COUNT(*) FROM {table_prefix}{table_name} {where_clause}) as total
FROM {table_prefix}{table_name}
{where_clause}
ORDER BY `{order_by}`
LIMIT {min_result_index},{max_results};