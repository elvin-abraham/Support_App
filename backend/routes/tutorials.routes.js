import { Router } from "express";
import {
  listProducts,
  listTutorialsForProduct,
  getTutorial,
  createProduct,
  createTutorial,
  uploadImages,
} from "../controllers/tutorials.controller.js";
import { upload } from "../config/upload.js";

const router = Router();

// Admin panel uses this to upload slide screenshots before publishing.
router.post("/uploads", upload.array("images", 20), uploadImages);

router.get("/products", listProducts);
router.post("/products", createProduct);

router.get("/products/:slug/tutorials", listTutorialsForProduct);
router.post("/products/:slug/tutorials", createTutorial);

router.get("/products/:productSlug/tutorials/:tutorialSlug", getTutorial);

export default router;
