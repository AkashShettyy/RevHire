import express from "express";
import {
  getResume,
  createOrUpdateResume,
} from "../controllers/resumeController.js";
import { protect, isJobSeeker } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, isJobSeeker, getResume);
router.post("/", protect, isJobSeeker, createOrUpdateResume);

export default router;