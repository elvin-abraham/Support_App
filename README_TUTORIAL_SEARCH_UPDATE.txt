INCLUZIV SUPPORT APP — TUTORIAL SEARCH UPDATE

What this update changes
------------------------
1. Normal chatbot questions still use Gemini and the existing knowledge base.
2. Tutorial search no longer calls Gemini.
3. Tutorial search is now local, so tutorial searches do NOT consume Gemini quota.
4. Every tutorial can have Related questions/search phrases entered in the Admin Panel.
5. The matcher automatically searches each tutorial's English title, Hindi title,
   and all Related questions.
6. The matcher handles punctuation, capitalization, spacing, and small typos.
7. You do NOT add tutorial-specific words to source code. When you create tutorial #51,
   simply enter its related questions in the Admin Panel.

FILES INCLUDED
--------------
The ZIP contains the complete updated support-app project.

HOW TO INSTALL
--------------
A. BACK UP YOUR CURRENT PROJECT FIRST.

B. Extract this ZIP.

C. Replace your current project files with the files from the extracted support-app folder.
   This ZIP includes your existing frontend/backend structure and the knowledge base.

D. IMPORTANT: keep your existing backend/.env file if you already have one.
   The ZIP only contains .env.example, not your private .env.

E. Run the database migration once against your existing support_app database:

   backend/db/migrations/001_add_related_questions.sql

   Example with MySQL:

   mysql -u YOUR_USER -p support_app < backend/db/migrations/001_add_related_questions.sql

   If you use MySQL Workbench, open that SQL file and run it while connected to support_app.

F. Install dependencies if needed:

   cd backend
   npm install

   cd ../frontend
   npm install

G. Start the backend and frontend the same way you normally do.

NEW ADMIN PANEL FIELD
---------------------
When creating a tutorial, under the Question section you will now see:

  Related questions / search phrases

Add natural ways a customer might ask for the same tutorial.

For a login tutorial, examples are:

  How do I login?
  How can I login?
  Login kaise kare?
  Login kaise karu?
  Kaisa login karna hai?
  लॉगिन कैसे करना है?
  लॉगिन कैसे करें?
  Login karne ka tarika kya hai?

You do NOT need to enter every possible typo. The local matcher handles small wording and typo differences.

However, the local matcher is not a full semantic AI model. For a completely different
unseen way of asking the question, add one representative Related question to that tutorial.
This is data entered in the Admin Panel — it does not require changing JavaScript code.

IMPORTANT FOR EXISTING TUTORIALS
--------------------------------
Existing tutorials will have an empty related_questions field after the migration.
Their existing English and Hindi titles will still be searchable automatically.

To improve matching for an existing tutorial, add related questions by creating/editing
that tutorial when tutorial editing is available in your admin workflow. The current
Admin Panel in this version adds the field for newly created tutorials.

TEST TO RUN
-----------
For the login tutorial, try searches such as:

  How to login?
  How do I login?
  Kaisa login karna hai?
  Login kaise kare?
  लॉगिन कैसे करें?
  Login kaise karu?

These should be matched locally without a Gemini API request.

CHATBOT / GEMINI
----------------
The normal support chatbot is unchanged in principle. It still uses Gemini with the
Incluziv knowledge base and can answer in English, Hindi, or Hinglish when the knowledge
base supports the answer.

If Gemini's free-tier quota is exhausted, normal chatbot requests can still fail because
those requests intentionally continue to use Gemini. Tutorial search will not consume that quota.
