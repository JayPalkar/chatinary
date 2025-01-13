import express from "express";

import { protectRoute } from "../middleware/authentication.middleware.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getAllUsers);
router.get("/:id", protectRoute, getMessages);

router.get("/chats", protectRoute, getAllChatsForSidebar);

router.post("/send/:id", protectRoute, sendMessage);

export default router;
