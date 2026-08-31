CREATE DATABASE IF NOT EXISTS support_app;
USE support_app;

-- A product the support team offers help for, e.g. "Incluziv Cloud"
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- A single how-to, e.g. "How to Login", "How to Generate an Invoice"
CREATE TABLE IF NOT EXISTS tutorials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  description VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_product_tutorial (product_id, slug)
);

-- One step within a tutorial: a screenshot, plus zero or more highlights
-- and zero or more statement boxes on it (stored as JSON arrays since
-- there can be any number of each, independently positioned), plus an
-- optional final "you're done" success message.
--
-- highlight_x/y/width/height are legacy columns from the single-highlight
-- version of this app and are no longer read or written to — kept only
-- so existing rows aren't broken. All new data lives in the JSON columns.
CREATE TABLE IF NOT EXISTS tutorial_steps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tutorial_id INT NOT NULL,
  step_number INT NOT NULL,
  screenshot_url VARCHAR(500) NOT NULL,
  highlight_x DECIMAL(5,2) NOT NULL DEFAULT 0,
  highlight_y DECIMAL(5,2) NOT NULL DEFAULT 0,
  highlight_width DECIMAL(5,2) NOT NULL DEFAULT 0,
  highlight_height DECIMAL(5,2) NOT NULL DEFAULT 0,
  highlights JSON NULL,   -- array of { x, y, width, height }, all percentages
  statements JSON NULL,   -- array of { x, y, text }, x/y are percentages
  instruction_text VARCHAR(500) NOT NULL, -- the final "you're done" message text
  is_final_step BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (tutorial_id) REFERENCES tutorials(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_tutorial_step (tutorial_id, step_number)
);
