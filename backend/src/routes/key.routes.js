import express from "express";
import { protectRoute } from "../middleware/authentication.middleware.js";
import {
  getUserPublicKey,
  publishPublicKey,
} from "../controllers/key.controller.js";

const router = express.Router();

router.post("/public-key", protectRoute, publishPublicKey);
router.get("/:id/public-key", protectRoute, getUserPublicKey);

export default router;
