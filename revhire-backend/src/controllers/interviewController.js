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

function buildInterviewSummary(interviewType, meetingLink, location) {
  if (interviewType === "online") {
    return meetingLink ? `Online interview link: ${meetingLink}` : "Online interview";
  }
  return location ? `Interview address: ${location}` : "In-person interview";
}

export const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, scheduledAt, interviewType, meetingLink = "", location = "" } = req.body;

    if (!applicationId || !scheduledAt || !interviewType) {
      return res.status(400).json({ message: "Application, date, and interview type are required" });
    }

    const interviewDate = new Date(scheduledAt);
    if (Number.isNaN(interviewDate.getTime())) {
      return res.status(400).json({ message: "Invalid interview date" });
    }

    if (interviewDate <= new Date()) {
      return res.status(400).json({ message: "Interview date must be in the future" });
    }

    if (!["online", "inperson"].includes(interviewType)) {
      return res.status(400).json({ message: "Invalid interview type" });
    }

    if (interviewType === "online" && !meetingLink.trim()) {
      return res.status(400).json({ message: "Meeting link is required for online interviews" });
    }

    if (interviewType === "inperson" && !location.trim()) {
      return res.status(400).json({ message: "Address is required for in-person interviews" });
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

    const existingInterview = await Interview.findOne({ application: application._id });
    const isReschedule = Boolean(existingInterview);

    const interview = await Interview.findOneAndUpdate(
      { application: application._id },
      {
        application: application._id,
        job: application.job._id,
        employer: req.user.id,
        jobSeeker: application.jobSeeker,
        scheduledAt: interviewDate,
        interviewType,
        meetingLink: interviewType === "online" ? meetingLink.trim() : "",
        location: interviewType === "inperson" ? location.trim() : "",
        status: "scheduled",
        responseStatus: "pending",
      },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
    )
      .populate("job", "title location")
      .populate("jobSeeker", "name email");

    await createNotification(
      application.jobSeeker,
      `${isReschedule ? "Interview rescheduled" : "You have been scheduled for an interview"} on ${formatInterviewDate(interviewDate)} for ${application.job.title}. ${buildInterviewSummary(interviewType, meetingLink.trim(), location.trim())}`,
    );

    res.status(200).json({ message: isReschedule ? "Interview rescheduled" : "Interview scheduled", interview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ jobSeeker: req.user.id, status: { $ne: "cancelled" } })
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

    const interviews = await Interview.find({ job: req.params.jobId, status: { $ne: "cancelled" } })
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

export const respondToInterview = async (req, res) => {
  try {
    const { responseStatus } = req.body;
    if (!["accepted", "declined"].includes(responseStatus)) {
      return res.status(400).json({ message: "Invalid interview response" });
    }

    const interview = await Interview.findById(req.params.id).populate("job", "title");
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.jobSeeker.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (interview.status === "cancelled") {
      return res.status(400).json({ message: "Cancelled interviews cannot be updated" });
    }

    interview.responseStatus = responseStatus;
    await interview.save();

    await createNotification(
      interview.employer,
      `Candidate ${responseStatus} the interview for ${interview.job.title} on ${formatInterviewDate(interview.scheduledAt)}`,
    );

    res.status(200).json({ message: `Interview ${responseStatus}`, interview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
