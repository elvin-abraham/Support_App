import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import tutorialsRoutes from "./routes/tutorials.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api", tutorialsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Support App API running on http://localhost:${PORT}`);
});
