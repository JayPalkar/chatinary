import express from "express";
import {
  login,
  logout,
  signup,
  updateProfile,
} from "../controllers/authentication.controller.js";
import { protectRoute } from "../middleware/authentication.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

export default router;
