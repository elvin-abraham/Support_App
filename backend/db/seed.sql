USE support_app;

INSERT INTO products (name, slug) VALUES ('Incluziv Cloud', 'incluziv-cloud');

SET @product_id = LAST_INSERT_ID();

INSERT INTO tutorials (product_id, title, slug, description)
VALUES (@product_id, 'How to Login', 'how-to-login', 'Step-by-step guide to logging into Incluziv Cloud.');

SET @tutorial_id = LAST_INSERT_ID();

-- Each step here uses one highlight + one statement box (the "pack"
-- pairing), stored as one-item JSON arrays — the same shape the admin
-- panel produces when you check both boxes and add exactly one of each.
INSERT INTO tutorial_steps
  (tutorial_id, step_number, screenshot_url, highlights, statements, instruction_text, is_final_step)
VALUES
  (@tutorial_id, 1, '/screenshots/login-page.png',
    JSON_ARRAY(JSON_OBJECT('x', 30.00, 'y', 28.00, 'width', 40.00, 'height', 8.00)),
    JSON_ARRAY(JSON_OBJECT('x', 30.00, 'y', 38.00, 'text', 'Enter your username here.')),
    '', FALSE),
  (@tutorial_id, 2, '/screenshots/login-page.png',
    JSON_ARRAY(JSON_OBJECT('x', 30.00, 'y', 42.00, 'width', 40.00, 'height', 8.00)),
    JSON_ARRAY(JSON_OBJECT('x', 30.00, 'y', 52.00, 'text', 'Enter your password here.')),
    '', FALSE),
  (@tutorial_id, 3, '/screenshots/login-page.png',
    JSON_ARRAY(JSON_OBJECT('x', 30.00, 'y', 56.00, 'width', 40.00, 'height', 8.00)),
    JSON_ARRAY(JSON_OBJECT('x', 30.00, 'y', 66.00, 'text', 'Enter the OTP received on your mobile number or email address.')),
    '', FALSE),
  (@tutorial_id, 4, '/screenshots/login-page.png',
    JSON_ARRAY(JSON_OBJECT('x', 30.00, 'y', 70.00, 'width', 40.00, 'height', 10.00)),
    JSON_ARRAY(JSON_OBJECT('x', 30.00, 'y', 82.00, 'text', 'Click this button to log in.')),
    '', FALSE),
  (@tutorial_id, 5, '/screenshots/logged-in-page.png',
    JSON_ARRAY(),
    JSON_ARRAY(),
    'You are now logged in. This is what your dashboard should look like.', TRUE);
