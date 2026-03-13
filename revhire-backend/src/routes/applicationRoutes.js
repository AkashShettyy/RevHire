import express from "express";
import {
  applyForJob,
  getUserApplications,
  withdrawApplication,
  getJobApplicants,
  updateApplicationStatus,
} from "../controllers/applicationController.js";
import {
  protect,
  isEmployer,
  isJobSeeker,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:jobId/apply", protect, isJobSeeker, applyForJob);
router.get("/my", protect, isJobSeeker, getUserApplications);
router.put("/:id/withdraw", protect, isJobSeeker, withdrawApplication);
router.get("/:jobId/applicants", protect, isEmployer, getJobApplicants);
router.put("/:id/status", protect, isEmployer, updateApplicationStatus);

export default router;
