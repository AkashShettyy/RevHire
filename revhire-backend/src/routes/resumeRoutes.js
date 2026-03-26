import express from "express";
import {
  getResume,
  createOrUpdateResume,
  deleteResume,
} from "../controllers/resumeController.js";
import { protect, isJobSeeker } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, isJobSeeker, getResume);
router.post("/", protect, isJobSeeker, createOrUpdateResume);
router.delete("/:id", protect, isJobSeeker, deleteResume);

export default router;
