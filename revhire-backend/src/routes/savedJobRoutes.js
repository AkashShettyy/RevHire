import express from "express";
import {
  getJobAlerts,
  getSavedJobs,
  removeSavedJob,
  saveJob,
} from "../controllers/savedJobController.js";
import { protect, isJobSeeker } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, isJobSeeker, getSavedJobs);
router.get("/alerts", protect, isJobSeeker, getJobAlerts);
router.post("/:jobId", protect, isJobSeeker, saveJob);
router.delete("/:jobId", protect, isJobSeeker, removeSavedJob);

export default router;
