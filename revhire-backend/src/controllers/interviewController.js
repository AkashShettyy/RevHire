import Application from "../models/Application.js";
import Interview from "../models/Interview.js";
import Job from "../models/Job.js";
import { createNotification } from "./notificationController.js";

function formatInterviewDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, scheduledAt } = req.body;

    if (!applicationId || !scheduledAt) {
      return res.status(400).json({ message: "Application and interview date are required" });
    }

    const interviewDate = new Date(scheduledAt);
    if (Number.isNaN(interviewDate.getTime())) {
      return res.status(400).json({ message: "Invalid interview date" });
    }

    if (interviewDate <= new Date()) {
      return res.status(400).json({ message: "Interview date must be in the future" });
    }

    const application = await Application.findById(applicationId).populate("job", "title employer");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.job?.employer?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (application.status !== "shortlisted") {
      return res.status(400).json({ message: "Only shortlisted candidates can be scheduled" });
    }

    const interview = await Interview.findOneAndUpdate(
      { application: application._id },
      {
        application: application._id,
        job: application.job._id,
        employer: req.user.id,
        jobSeeker: application.jobSeeker,
        scheduledAt: interviewDate,
        status: "scheduled",
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )
      .populate("job", "title location")
      .populate("jobSeeker", "name email");

    await createNotification(
      application.jobSeeker,
      `Interview scheduled for ${application.job.title} on ${formatInterviewDate(interviewDate)}`,
    );

    res.status(200).json({ message: "Interview scheduled", interview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ jobSeeker: req.user.id, status: "scheduled" })
      .populate("job", "title location")
      .populate("employer", "name email")
      .sort({ scheduledAt: 1 });

    res.status(200).json({ interviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobInterviews = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const interviews = await Interview.find({ job: req.params.jobId, status: "scheduled" })
      .populate("application", "_id")
      .populate("jobSeeker", "name email")
      .sort({ scheduledAt: 1 });

    res.status(200).json({ interviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).populate("job", "title");
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.employer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    interview.status = "cancelled";
    await interview.save();

    await createNotification(
      interview.jobSeeker,
      `Interview cancelled for ${interview.job.title}`,
    );

    res.status(200).json({ message: "Interview cancelled", interview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
