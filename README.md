# Support Application — Interactive Step-by-Step Tutorials

Skeleton project for the customer-support tutorial tool discussed:
customers pick a product + question, then follow a game-style tutorial
where the correct field/button is highlighted with an instruction card,
and click "Next" as they perform each step in their own app tab.

## Structure

```
support-app/
├── backend/          Node.js + Express + MySQL API
│   ├── config/db.js          MySQL connection pool
│   ├── db/schema.sql         Table definitions
│   ├── db/seed.sql           Sample data (Incluziv Cloud login tutorial)
│   ├── controllers/          Request handlers
│   ├── routes/                API routes
│   └── server.js              App entry point
└── frontend/         React (Vite) tutorial player
    ├── src/api/tutorials.js       Fetch wrappers for the backend
    ├── src/components/
    │   ├── ProductSelector.jsx    Pick a product + tutorial
    │   ├── TutorialPlayer.jsx     Drives step state, Next/Back
    │   ├── HighlightBox.jsx       Positioned highlight rectangle
    │   └── InstructionCard.jsx    The instruction text bubble
    └── src/data/sampleTutorial.json  Local fallback data (works with no backend)
```

## Why this shape

- **Highlights/instruction cards are HTML/CSS, not Canva images.** They're
  positioned as a percentage of the screenshot's dimensions and driven by
  data, so a new tutorial step is a new database row, not new design work.
- **Screenshots are static images** (product ones you'd export from Canva,
  Figma, or an actual screenshot). Only the overlay is code.
- **Everything is data-driven.** `tutorial_steps` rows define screenshot +
  highlight coordinates + instruction text + step order. Adding
  "How to generate an invoice" later means adding rows, not new components.

## Running the backend

```bash
cd backend
npm install
cp .env.example .env      # fill in your MySQL credentials
mysql -u root -p < db/schema.sql
mysql -u root -p < db/seed.sql
npm run dev                # starts on http://localhost:4000
```

## Running the frontend

```bash
cd frontend
npm install
npm run dev                 # starts on http://localhost:5173
```

The frontend works two ways:
1. **With the backend running** — it fetches real tutorials from the API.
2. **Without a backend** — `src/data/sampleTutorial.json` lets you preview
   the tutorial player standalone (useful for design review before the
   backend/database exist).

## Admin panel

Visit **`/admin`** (e.g. `http://localhost:5173/admin`) to create tutorials
without touching code or the database directly:

1. Pick an existing product or add a new one.
2. Type the question (e.g. "How to add a ledger?").
3. Upload one image per slide, using "+ Add another slide" for more.
4. Per slide, independently toggle a highlighter (click-and-drag on the
   image to draw it, drag to move, use the corner handle to resize) and/or
   a statement box, and type its text. Mark the last slide as the "final"
   step for the completion message instead.
5. **Preview tutorial** renders it in the real, live tutorial player.
6. **Confirm & Publish** creates the product (if new) and tutorial with all
   its steps in the database in one go — it's live for customers immediately.

Uploaded images are stored in `backend/uploads/` and served at
`/uploads/<filename>` (proxied through Vite in dev — see `vite.config.js`).

## Next steps to build out

1. Add authentication in front of `/admin` — right now anyone who knows the
   URL can publish tutorials. A simple shared password or proper login
   would be a sensible next step before this goes anywhere public-facing.
2. Add an "edit existing tutorial" flow (currently admin can only create
   new ones, not modify or delete published tutorials).
3. Add a `products` list endpoint-driven landing page (currently stubbed).
4. Decide on screenshot storage (local `/public`, S3, etc.) once you know
   hosting — `backend/uploads/` works for a single server but won't
   survive a redeploy on most hosting platforms without a persistent disk
   or object storage.
5. Optional later enhancement: a lightweight browser extension that can
   confirm a step was actually completed in the real app, instead of
   relying on the customer clicking "Next" manually.
