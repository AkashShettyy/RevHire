import express from "express";
import {
  getNotifications,
  markAllRead,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.put("/read", protect, markAllRead);

export default router;
