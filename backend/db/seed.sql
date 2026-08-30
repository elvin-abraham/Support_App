USE support_app;

INSERT INTO products (name, slug) VALUES ('Incluziv Cloud', 'incluziv-cloud');

SET @product_id = LAST_INSERT_ID();

INSERT INTO tutorials (product_id, title, slug, description)
VALUES (@product_id, 'How to Login', 'how-to-login', 'Step-by-step guide to logging into Incluziv Cloud.');

SET @tutorial_id = LAST_INSERT_ID();

INSERT INTO tutorial_steps
  (tutorial_id, step_number, screenshot_url, highlight_x, highlight_y, highlight_width, highlight_height, instruction_text, is_final_step)
VALUES
  (@tutorial_id, 1, '/screenshots/login-page.png', 30.00, 28.00, 40.00, 8.00, 'Enter your username here.', FALSE),
  (@tutorial_id, 2, '/screenshots/login-page.png', 30.00, 42.00, 40.00, 8.00, 'Enter your password here.', FALSE),
  (@tutorial_id, 3, '/screenshots/login-page.png', 30.00, 56.00, 40.00, 8.00, 'Enter the OTP received on your mobile number or email address.', FALSE),
  (@tutorial_id, 4, '/screenshots/login-page.png', 30.00, 70.00, 40.00, 10.00, 'Click this button to log in.', FALSE),
  (@tutorial_id, 5, '/screenshots/logged-in-page.png', 0.00, 0.00, 0.00, 0.00, 'You are now logged in. This is what your dashboard should look like.', TRUE);
