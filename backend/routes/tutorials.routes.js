import { Router } from "express";
import {
  listProducts,
  listTutorialsForProduct,
  listAllTutorials,
  matchTutorialQuery,
  getTutorial,
  createProduct,
  createTutorial,
  updateTutorial,
  deleteTutorial,
  uploadImages,
} from "../controllers/tutorials.controller.js";
import { upload } from "../config/upload.js";

const router = Router();

router.post("/uploads", upload.array("images", 20), uploadImages);
router.get("/products", listProducts);
router.post("/products", createProduct);

// Flat list across all products — used by the admin's "manage tutorials"
// screen and by the customer app's free-text search suggestions.
router.get("/tutorials", listAllTutorials);

// AI-based fallback match when the customer's typed question doesn't
// obviously match any tutorial title as-is.
router.post("/tutorials/match", matchTutorialQuery);

router.get("/products/:slug/tutorials", listTutorialsForProduct);
router.post("/products/:slug/tutorials", createTutorial);
router.put("/products/:productSlug/tutorials/:tutorialSlug", updateTutorial);
router.get("/products/:productSlug/tutorials/:tutorialSlug", getTutorial);
router.delete("/products/:productSlug/tutorials/:tutorialSlug", deleteTutorial);

export default router;
