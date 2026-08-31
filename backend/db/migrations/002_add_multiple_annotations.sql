-- Adds support for multiple independent highlighters and statement
-- boxes per slide. Safe to run once against your existing database.
USE support_app;

ALTER TABLE tutorial_steps
  ADD COLUMN highlights JSON NULL AFTER highlight_height,
  ADD COLUMN statements JSON NULL AFTER highlights;
