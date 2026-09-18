-- Adds Hindi/English bilingual support for product names, tutorial
-- titles, and the success-message text. Statement text (per highlight)
-- doesn't need a migration — it already lives inside the flexible
-- `statements` JSON column, so a Hindi variant just adds a new key
-- (`textHindi`) to each entry going forward, no schema change needed.
USE support_app;

ALTER TABLE products
  ADD COLUMN name_hindi VARCHAR(120) NULL AFTER name;

ALTER TABLE tutorials
  ADD COLUMN title_hindi VARCHAR(200) NULL AFTER title;

ALTER TABLE tutorial_steps
  ADD COLUMN instruction_text_hindi VARCHAR(500) NULL AFTER instruction_text;
