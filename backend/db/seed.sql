USE support_app;

INSERT INTO products (name, name_hindi, slug) VALUES ('Incluziv Cloud', 'इंक्लूज़िव क्लाउड', 'incluziv-cloud');

SET @product_id = LAST_INSERT_ID();

INSERT INTO tutorials (product_id, title, title_hindi, slug, description, related_questions)
VALUES (@product_id, 'How to Login', 'लॉगिन कैसे करें', 'how-to-login', 'Step-by-step guide to logging into Incluziv Cloud.', JSON_ARRAY(
  'How do I login?',
  'How can I login?',
  'Login kaise kare?',
  'Login kaise karu?',
  'Kaisa login karna hai?',
  'लॉगिन कैसे करना है?',
  'लॉगिन कैसे करें?',
  'Login karne ka tarika kya hai?'
));

SET @tutorial_id = LAST_INSERT_ID();

INSERT INTO tutorial_steps
  (tutorial_id, step_number, screenshot_url, highlights, statements, instruction_text, instruction_text_hindi, is_final_step)
VALUES
  (@tutorial_id, 1, '/screenshots/login-page.png',
    JSON_ARRAY(JSON_OBJECT('x', 30.00, 'y', 28.00, 'width', 40.00, 'height', 8.00)),
    JSON_ARRAY(JSON_OBJECT('x', 30.00, 'y', 38.00, 'text', 'Enter your username here.', 'textHindi', 'यहाँ अपना यूज़रनेम दर्ज करें।')),
    '', NULL, FALSE),
  (@tutorial_id, 2, '/screenshots/login-page.png',
    JSON_ARRAY(JSON_OBJECT('x', 30.00, 'y', 42.00, 'width', 40.00, 'height', 8.00)),
    JSON_ARRAY(JSON_OBJECT('x', 30.00, 'y', 52.00, 'text', 'Enter your password here.', 'textHindi', 'यहाँ अपना पासवर्ड दर्ज करें।')),
    '', NULL, FALSE),
  (@tutorial_id, 3, '/screenshots/login-page.png',
    JSON_ARRAY(JSON_OBJECT('x', 30.00, 'y', 56.00, 'width', 40.00, 'height', 8.00)),
    JSON_ARRAY(JSON_OBJECT('x', 30.00, 'y', 66.00, 'text', 'Enter the OTP received on your mobile number or email address.', 'textHindi', 'अपने मोबाइल नंबर या ईमेल पर मिला OTP दर्ज करें।')),
    '', NULL, FALSE),
  (@tutorial_id, 4, '/screenshots/login-page.png',
    JSON_ARRAY(JSON_OBJECT('x', 30.00, 'y', 70.00, 'width', 40.00, 'height', 10.00)),
    JSON_ARRAY(JSON_OBJECT('x', 30.00, 'y', 82.00, 'text', 'Click this button to log in.', 'textHindi', 'लॉग इन करने के लिए यह बटन दबाएँ।')),
    '', NULL, FALSE),
  (@tutorial_id, 5, '/screenshots/logged-in-page.png',
    JSON_ARRAY(),
    JSON_ARRAY(),
    'You are now logged in. This is what your dashboard should look like.',
    'अब आप लॉग इन हो चुके हैं। आपका डैशबोर्ड कुछ इस तरह दिखना चाहिए।',
    TRUE);
