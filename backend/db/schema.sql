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

-- One step within a tutorial: a screenshot + a highlighted area + instructions.
-- Highlight coordinates are stored as PERCENTAGES (0-100) of the screenshot's
-- width/height, not pixels, so the overlay stays correctly positioned
-- regardless of how large the screenshot is rendered on screen.
CREATE TABLE IF NOT EXISTS tutorial_steps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tutorial_id INT NOT NULL,
  step_number INT NOT NULL,
  screenshot_url VARCHAR(500) NOT NULL,
  highlight_x DECIMAL(5,2) NOT NULL,      -- left,   % of image width
  highlight_y DECIMAL(5,2) NOT NULL,      -- top,    % of image height
  highlight_width DECIMAL(5,2) NOT NULL,  -- width,  % of image width
  highlight_height DECIMAL(5,2) NOT NULL, -- height, % of image height
  instruction_text VARCHAR(500) NOT NULL,
  is_final_step BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (tutorial_id) REFERENCES tutorials(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_tutorial_step (tutorial_id, step_number)
);
