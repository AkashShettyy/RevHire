import express from "express";
import {
  cancelInterview,
  getEmployerInterviews,
  getJobInterviews,
  getMyInterviews,
  respondToInterview,
  scheduleInterview,
} from "../controllers/interviewController.js";
import {
  protect,
  isEmployer,
  isJobSeeker,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, isEmployer, scheduleInterview);
router.get("/my", protect, isJobSeeker, getMyInterviews);
router.get("/employer", protect, isEmployer, getEmployerInterviews);
router.get("/job/:jobId", protect, isEmployer, getJobInterviews);
router.put("/:id/cancel", protect, isEmployer, cancelInterview);
router.put("/:id/respond", protect, isJobSeeker, respondToInterview);

export default router;
