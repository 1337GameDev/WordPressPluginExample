#Uses placeholder for values
DELETE  ss.* FROM {table_prefix}StoredStrings ss
WHERE `id` IN (
	SELECT `id` FROM (
		SELECT `id` FROM {table_prefix}_StoredStrings
		WHERE `id` NOT IN (
		    # Correlated subqueries to be used to get IDs everywhere strings can be used

			# SELECT `storedstring` FROM {table_prefix}_Keywords
			# UNION
			# SELECT `storedstring` FROM {table_prefix}_Tags
		)
		ORDER BY `id`
    ) sub
);