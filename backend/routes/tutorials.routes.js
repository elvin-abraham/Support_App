import { Router } from "express";
import {
  listProducts,
  listTutorialsForProduct,
  getTutorial,
  createProduct,
  createTutorial,
} from "../controllers/tutorials.controller.js";

const router = Router();

router.get("/products", listProducts);
router.post("/products", createProduct);

router.get("/products/:slug/tutorials", listTutorialsForProduct);
router.post("/products/:slug/tutorials", createTutorial);

router.get("/products/:productSlug/tutorials/:tutorialSlug", getTutorial);

export default router;
