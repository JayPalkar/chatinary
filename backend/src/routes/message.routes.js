import express from "express";

import { protectRoute } from "../middleware/authentication.middleware.js";
import {
  getAllChatsForSidebar,
  getAllUsers,
  getMessages,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/chats", protectRoute, getAllChatsForSidebar);
router.get("/users", protectRoute, getAllUsers);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);

export default router;
