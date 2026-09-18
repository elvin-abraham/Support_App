import { Router } from "express";
import { chatReply } from "../controllers/chat.controller.js";

const router = Router();
router.post("/chat", chatReply);

export default router;
