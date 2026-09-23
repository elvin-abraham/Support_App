USE support_app;

SET SQL_SAFE_UPDATES = 0;

UPDATE tutorials
SET related_questions = JSON_ARRAY(
    'How to login?',
    'How do I login?',
    'How can I login?',
    'Login kaise kare?',
    'Login kaise karu?',
    'Kaisa login karna hai?',
    'लॉगिन कैसे करना है?',
    'लॉगिन कैसे करें?',
    'Login karne ka tarika kya hai?'
)
WHERE slug = 'how-to-login';

SET SQL_SAFE_UPDATES = 1;