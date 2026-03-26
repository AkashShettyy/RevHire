import Job from "../models/Job.js";
import SavedJob from "../models/SavedJob.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const saveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job || job.status !== "open") {
      return res.status(404).json({ message: "Job not found" });
    }

    const savedJob = await SavedJob.findOneAndUpdate(
      { jobSeeker: req.user.id, job: req.params.jobId },
      { jobSeeker: req.user.id, job: req.params.jobId },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );

    res.status(201).json({ message: "Job saved", savedJob });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeSavedJob = async (req, res) => {
  try {
    await SavedJob.findOneAndDelete({
      jobSeeker: req.user.id,
      job: req.params.jobId,
    });

    res.status(200).json({ message: "Saved job removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSavedJobs = async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({ jobSeeker: req.user.id })
      .populate({
        path: "job",
        populate: {
          path: "organization",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });

    const filteredSavedJobs = savedJobs.filter((entry) => entry.job);

    res.status(200).json({ savedJobs: filteredSavedJobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobAlerts = async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({ jobSeeker: req.user.id })
      .populate("job")
      .sort({ createdAt: -1 });

    const availableSavedJobs = savedJobs.map((entry) => entry.job).filter(Boolean);
    if (availableSavedJobs.length === 0) {
      return res.status(200).json({ alerts: [] });
    }

    const savedJobIds = availableSavedJobs.map((job) => job._id);
    const titlePatterns = availableSavedJobs
      .map((job) => job.title?.trim())
      .filter(Boolean)
      .slice(0, 5);
    const skillPatterns = availableSavedJobs
      .flatMap((job) => job.skillsRequired || [])
      .filter(Boolean)
      .slice(0, 12);
    const locations = availableSavedJobs
      .map((job) => job.location?.trim())
      .filter(Boolean)
      .slice(0, 5);

    const clauses = [];

    if (titlePatterns.length > 0) {
      clauses.push({
        $or: titlePatterns.map((title) => ({
          title: { $regex: escapeRegex(title), $options: "i" },
        })),
      });
    }

    if (skillPatterns.length > 0) {
      clauses.push({
        skillsRequired: {
          $in: skillPatterns.map((skill) => new RegExp(escapeRegex(skill), "i")),
        },
      });
    }

    if (locations.length > 0) {
      clauses.push({
        $or: locations.map((location) => ({
          location: { $regex: escapeRegex(location), $options: "i" },
        })),
      });
    }

    const alerts = await Job.find({
      status: "open",
      _id: { $nin: savedJobIds },
      createdAt: {
        $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
      },
      ...(clauses.length > 0 ? { $or: clauses } : {}),
    })
      .populate("organization", "name")
      .sort({ createdAt: -1 })
      .limit(8);

    res.status(200).json({ alerts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
