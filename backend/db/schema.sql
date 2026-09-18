CREATE DATABASE IF NOT EXISTS support_app;
USE support_app;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  name_hindi VARCHAR(120) NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tutorials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  title_hindi VARCHAR(200) NULL,
  slug VARCHAR(200) NOT NULL,
  description VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_product_tutorial (product_id, slug)
);

CREATE TABLE IF NOT EXISTS tutorial_steps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tutorial_id INT NOT NULL,
  step_number INT NOT NULL,
  screenshot_url VARCHAR(500) NOT NULL,
  highlight_x DECIMAL(5,2) NOT NULL DEFAULT 0,
  highlight_y DECIMAL(5,2) NOT NULL DEFAULT 0,
  highlight_width DECIMAL(5,2) NOT NULL DEFAULT 0,
  highlight_height DECIMAL(5,2) NOT NULL DEFAULT 0,
  highlights JSON NULL,
  statements JSON NULL,
  instruction_text VARCHAR(500) NOT NULL,
  instruction_text_hindi VARCHAR(500) NULL,
  is_final_step BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (tutorial_id) REFERENCES tutorials(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_tutorial_step (tutorial_id, step_number)
);
