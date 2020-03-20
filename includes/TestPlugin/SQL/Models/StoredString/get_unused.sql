#Uses placeholder for values

SELECT `id` FROM {table_prefix}StoredStrings
WHERE `id` NOT IN (
	SELECT `storedstring` FROM {table_prefix}_ResourceKeywords
    UNION
    SELECT `storedstring` FROM {table_prefix}_ResourceTags
)
ORDER BY `id`;