import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Resume from "../models/Resume.js";
import { createNotification } from "./notificationController.js";
import { canAccessOrganization } from "../utils/organizationAccess.js";

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

    let initialStatus = "applied";
    const userAnswers = req.body.answers || [];
    let resumeVersion = null;

    if (req.body.resumeVersionId) {
      resumeVersion = await Resume.findOne({
        _id: req.body.resumeVersionId,
        jobSeeker: req.user.id,
      });
      if (!resumeVersion) {
        return res.status(400).json({ message: "Selected resume version not found" });
      }
    } else {
      resumeVersion = await Resume.findOne({ jobSeeker: req.user.id }).sort({
        isDefault: -1,
        updatedAt: -1,
      });
    }

    // Knockout logic: if required return answer is strict, mark rejected
    if (job.screeningQuestions && job.screeningQuestions.length > 0) {
      for (const sq of job.screeningQuestions) {
        if (sq.requiredAnswer && sq.requiredAnswer.trim() !== "") {
          const uq = userAnswers.find(
            (a) => a.question.toLowerCase() === sq.question.toLowerCase()
          );
          if (!uq || uq.answer.toLowerCase() !== sq.requiredAnswer.toLowerCase()) {
            initialStatus = "rejected";
            break;
          }
        }
      }
    }

    const application = await Application.create({
      job: req.params.jobId,
      jobSeeker: req.user.id,
      coverLetter: req.body.coverLetter || "",
      answers: userAnswers,
      resumeVersion: resumeVersion?._id || null,
      status: initialStatus,
    });

    // notify employer
    // await createNotification(
    //   job.organization,
    //   `New application received for ${job.title}`,
    // );

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

//Withdraw
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
    if (!(await canAccessOrganization(job.organization, req.user.organizationId))) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const applications = await Application.find({ job: req.params.jobId })
      .populate("jobSeeker", "name email")
      .populate("resumeVersion")
      .populate("notes.author", "name email")
      .sort({ createdAt: -1 });

    const applicationsWithResumes = applications.map((application) => {
      const current = application.toObject();
      return {
        ...current,
        resume: current.resumeVersion || null,
      };
    });

    res.status(200).json({ applications: applicationsWithResumes });
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
    if (!(await canAccessOrganization(job.organization, req.user.organizationId))) {
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

export const addApplicationNote = async (req, res) => {
  try {
    const { text, rating } = req.body;
    const application = await Application.findById(req.params.id).populate("job");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (!(await canAccessOrganization(application.job.organization, req.user.organizationId))) {
      return res.status(403).json({ message: "Not authorized to add notes" });
    }

    application.notes.push({
      author: req.user.id,
      text,
      rating: rating || null,
    });

    await application.save();
    
    // Populate the author data before sending the response back so frontend has name
    await application.populate("notes.author", "name email");
    
    res.status(200).json({ message: "Note added successfully", application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
