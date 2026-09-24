FIX: Existing related questions not showing when editing a tutorial

Problem:
The related_questions data was stored correctly in MySQL, but the GET tutorial API used by the Edit Tutorial screen did not include the related_questions column in its SELECT query. As a result, the Edit screen received no relatedQuestions value and showed an empty field.

Fix:
backend/controllers/tutorials.controller.js now selects:
  t.related_questions AS relatedQuestions

The existing JSON parsing in getTutorial converts that database value into an array for the frontend.

No database migration is required.
No existing tutorial data is changed.

After replacing this project:
1. Keep your existing backend/.env.
2. Keep your existing MySQL database.
3. Restart the backend server.
4. Refresh the frontend.
5. Open Manage tutorials -> Edit.
6. The saved related questions should now appear.
