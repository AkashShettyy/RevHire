import express from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getEmployerJobs,
  getEmployerAnalytics,
} from "../controllers/jobController.js";
import { protect, isEmployer } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/employer/myjobs", protect, isEmployer, getEmployerJobs);
router.get("/employer/analytics", protect, isEmployer, getEmployerAnalytics);
router.get("/", getAllJobs);
router.get("/:id", getJobById);
router.post("/", protect, isEmployer, createJob);
router.put("/:id", protect, isEmployer, updateJob);
router.delete("/:id", protect, isEmployer, deleteJob);

export default router;
