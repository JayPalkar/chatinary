import express from "express";

import { protectRoute } from "../middleware/authentication.middleware.js";
import {
  getMessages,
  getUsersForSidebar,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

export default router;
