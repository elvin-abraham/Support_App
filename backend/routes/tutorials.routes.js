import { Router } from "express";
import {
  listProducts,
  listTutorialsForProduct,
  listAllTutorials,
  getTutorial,
  createProduct,
  createTutorial,
  deleteTutorial,
  uploadImages,
} from "../controllers/tutorials.controller.js";
import { upload } from "../config/upload.js";

const router = Router();

// Admin panel uses this to upload slide screenshots before publishing.
router.post("/uploads", upload.array("images", 20), uploadImages);

router.get("/products", listProducts);
router.post("/products", createProduct);

// Flat list across all products — used by the admin's "manage tutorials" screen.
router.get("/tutorials", listAllTutorials);

router.get("/products/:slug/tutorials", listTutorialsForProduct);
router.post("/products/:slug/tutorials", createTutorial);

router.get("/products/:productSlug/tutorials/:tutorialSlug", getTutorial);
router.delete("/products/:productSlug/tutorials/:tutorialSlug", deleteTutorial);

export default router;
