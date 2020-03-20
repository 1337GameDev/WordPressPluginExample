#Uses placeholder for values

SELECT SUM(`filesize`) as 'size_in_bytes',
(
  SELECT COUNT(*) FROM {table_prefix}_Resources
) as 'count'
FROM {table_prefix}_ResourceVersions;