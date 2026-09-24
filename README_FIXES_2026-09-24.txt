SUPPORT APP FIXES - 2026-09-24

This version fixes two issues requested:

1. MANAGE TUTORIALS - EDIT
- Added an Edit button beside Delete for every tutorial.
- Edit opens the existing tutorial in the tutorial builder.
- Existing screenshots, highlights, statement boxes, English/Hindi text, final messages, and related questions are loaded.
- Preview can be used before saving.
- Save changes updates the existing tutorial without creating a duplicate.
- Product remains unchanged while editing.
- No database migration is required for this feature.

2. CHATBOT TUTORIAL CARD OPENS EMPTY TUTORIAL
- Fixed the mismatch between the chatbot suggestion object (tutorialSlug) and the search suggestion object (slug).
- Tutorial detail API now also normalizes JSON fields correctly, including highlights, statements, and related questions.
- Clicking a tutorial suggested by the chatbot now opens the actual stored tutorial content.

FILES CHANGED
Backend:
- backend/controllers/tutorials.controller.js
- backend/routes/tutorials.routes.js

Frontend:
- frontend/src/api/admin.js
- frontend/src/admin/AdminApp.jsx
- frontend/src/admin/ManageTutorials.jsx
- frontend/src/admin/TutorialBuilder.jsx
- frontend/src/components/ProductSelector.jsx
- frontend/src/styles/admin.css

DATABASE
- No new SQL migration is required. Existing database structure is sufficient.

HOW TO USE
1. Replace your current project with this updated project, or replace the changed files listed above.
2. Keep your existing backend/.env file and database data.
3. Restart backend and frontend.
4. Open Admin -> Manage tutorials -> Edit.
5. For chatbot tutorial suggestions, start a chat and click the suggested tutorial card.
