USE support_app;

SET @column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tutorials'
    AND COLUMN_NAME = 'related_questions'
);

SET @sql = IF(
  @column_exists = 0,
  'ALTER TABLE tutorials ADD COLUMN related_questions JSON NULL AFTER description',
  'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
