import Application from "../models/Application.js";
import Job from "../models/Job.js";
import { createNotification } from "./notificationController.js";

export const applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.status === "closed") {
      return res.status(400).json({ message: "Job is closed" });
    }

    const existing = await Application.findOne({
      job: req.params.jobId,
      jobSeeker: req.user.id,
    });
    if (existing) {
      return res.status(400).json({ message: "Already applied for this job" });
    }

    const application = await Application.create({
      job: req.params.jobId,
      jobSeeker: req.user.id,
      coverLetter: req.body.coverLetter || "",
    });

    // notify employer
    await createNotification(
      job.employer,
      `New application received for ${job.title}`,
    );

    res.status(201).json({ message: "Applied successfully", application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserApplications = async (req, res) => {
  try {
    const applications = await Application.find({ jobSeeker: req.user.id })
      .populate("job", "title location jobType salaryRange status")
      .sort({ createdAt: -1 });
    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    if (application.jobSeeker.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    application.status = "withdrawn";
    await application.save();
    res.status(200).json({ message: "Application withdrawn" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const applications = await Application.find({ job: req.params.jobId })
      .populate("jobSeeker", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id).populate(
      "job",
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const job = await Job.findById(application.job);
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    application.status = status;
    await application.save();

    // notify jobseeker
    await createNotification(
      application.jobSeeker,
      `Your application for ${job.title} has been ${status}`,
    );

    res.status(200).json({ message: "Status updated", application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
