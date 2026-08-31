# Support Application — Interactive Step-by-Step Tutorials

Customers pick a product + question, then follow a game-style tutorial
where highlighted fields/buttons and callout statements guide them
through the real steps, clicking "Next" as they perform each one in
their own app tab.

## Structure

```
support-app/
├── backend/          Node.js + Express + MySQL API
│   ├── config/           MySQL pool + multer upload config
│   ├── db/schema.sql          Table definitions (fresh installs)
│   ├── db/migrations/         Incremental changes for existing databases
│   ├── db/seed.sql            Sample data (Incluziv Cloud login tutorial)
│   ├── controllers/           Request handlers
│   ├── routes/                API routes
│   └── server.js              App entry point
└── frontend/         React (Vite) app
    ├── src/App.jsx / main.jsx         Customer-facing app + /admin routing
    ├── src/components/                Tutorial player (customer-facing)
    ├── src/admin/                     Admin panel (tutorial builder, editor, manage/delete)
    ├── src/api/                       Fetch wrappers for the backend
    └── src/data/sampleTutorial.json   Local fallback data (works with no backend)
```

## Data model

Each tutorial step can have:
- **Zero or more highlights** — independently positioned/sized boxes over the screenshot.
- **Zero or more statement boxes** — independently positioned callout text.
- **An optional final "you're done" success message** — a green banner shown on that step.

Highlights and statements are stored as JSON arrays per step
(`highlights`, `statements` columns), so a slide can have just a
highlighter, just a statement, several of each, or none at all.

## Running the backend

```bash
cd backend
npm install
cp .env.example .env      # fill in your MySQL credentials
mysql -u root -p < db/schema.sql          # fresh install
mysql -u root -p < db/seed.sql
npm run dev                # starts on http://localhost:4000
```

If you have an existing database from before the multi-highlight update,
run the migration instead of relying on `schema.sql` (which won't alter
an existing table):

```bash
mysql -u root -p < db/migrations/002_add_multiple_annotations.sql
```

## Running the frontend

```bash
cd frontend
npm install
npm run dev                 # starts on http://localhost:5173
```

## Admin panel

Visit **`/admin`** (e.g. `http://localhost:5173/admin`):

- **Create tutorial** — pick/create a product, enter the question, upload
  slide images (use "+ Add another slide" for more), then per slide:
  - Check **Add a highlighter**, then use **+ / −** to add or remove
    highlight boxes one at a time (drag to move, corner handle to resize).
  - Check **Add a statement box**, then use **+ / −** the same way (drag
    to move; type each one's text in the list below the image).
  - Check **This is the final "you're done" step** for a green completion
    banner instead of highlights/statements on that slide.
  - **Preview tutorial** renders it in the real, live tutorial player.
  - **Confirm & Publish** creates the product (if new) and tutorial with
    all its steps in the database — live for customers immediately.
- **Manage tutorials** — lists everything published, grouped by product,
  with a confirm-then-delete action per tutorial.

## Next steps to build out

1. Add authentication in front of `/admin` — right now anyone who knows
   the URL can publish or delete tutorials. A basic password gate is a
   sensible next step before this touches a real server.
2. Add an "edit existing tutorial" flow (currently admin can create and
   delete, but not modify a published tutorial's content).
3. Add a `products` list endpoint-driven landing page (currently stubbed).
4. Decide on screenshot storage (local `/public`, S3, etc.) once you know
   hosting — `backend/uploads/` works for a single server but won't
   survive a redeploy on most hosting platforms without a persistent disk
   or object storage.
5. Optional later enhancement: a lightweight browser extension that can
   confirm a step was actually completed in the real app, instead of
   relying on the customer clicking "Next" manually.
