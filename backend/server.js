import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import tutorialsRoutes from "./routes/tutorials.routes.js";
import { UPLOADS_DIR } from "./config/upload.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Uploaded tutorial screenshots are served directly from here, e.g.
// GET /uploads/1699999999-123456789.png
app.use("/uploads", express.static(UPLOADS_DIR));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api", tutorialsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Catches multer errors (oversized file, wrong type) and anything else
// thrown in a route, so the admin panel gets a clean JSON error instead
// of a raw stack trace.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ error: err.message || "Something went wrong" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Support App API running on http://localhost:${PORT}`);
});
