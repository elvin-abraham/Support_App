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

## Next steps to build out

1. Wire up an admin screen (or even a JSON upload) so support staff can add
   tutorials without a developer touching code.
2. Add a `products` list endpoint-driven landing page (currently stubbed).
3. Decide on screenshot storage (local `/public`, S3, etc.) once you know
   hosting.
4. Optional later enhancement: a lightweight browser extension that can
   confirm a step was actually completed in the real app, instead of
   relying on the customer clicking "Next" manually.
