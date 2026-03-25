import Job from "../models/Job.js";
import Organization from "../models/Organization.js";
import Application from "../models/Application.js";
import { getAccessibleOrganizationIds, canAccessOrganization } from "../utils/organizationAccess.js";

export const createJob = async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      organization: req.user.organizationId,
    });
    res.status(201).json({ message: "Job created successfully", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const { search, location, jobType, experience, company } = req.query;

    let filter = { status: "open" };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { skillsRequired: { $regex: search, $options: "i" } }
      ];
    }

    if (location) filter.location = { $regex: location, $options: "i" };
    if (jobType) filter.jobType = jobType;
    if (experience) filter.experienceRequired = experience;

    if (company) {
      const matchedOrgs = await Organization.find({ name: { $regex: company, $options: "i" } }).select('_id');
      const orgIds = matchedOrgs.map(org => org._id);
      filter.organization = { $in: orgIds };
    }

    const jobs = await Job.find(filter)
      .populate("organization", "name joinCode")
      .sort({ createdAt: -1 });

    res.status(200).json({ jobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "organization",
      "name joinCode",
    );

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.status(200).json({ job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    if (!(await canAccessOrganization(job.organization, req.user.organizationId))) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
    });

    res.status(200).json({ message: "Job updated", job: updatedJob });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    if (!(await canAccessOrganization(job.organization, req.user.organizationId))) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmployerJobs = async (req, res) => {
  try {
    const accessibleOrganizationIds = await getAccessibleOrganizationIds(
      req.user.organizationId,
    );

    const jobs = await Job.find({
      organization: { $in: accessibleOrganizationIds },
    }).sort({
      createdAt: -1,
    });

    const applicantCounts = await Application.aggregate([
      {
        $match: {
          job: { $in: jobs.map((job) => job._id) },
        },
      },
      {
        $group: {
          _id: "$job",
          count: { $sum: 1 },
        },
      },
    ]);

    const applicantCountMap = new Map(
      applicantCounts.map((entry) => [entry._id.toString(), entry.count]),
    );

    const jobsWithApplicantCounts = jobs.map((job) => {
      const current = job.toObject();
      return {
        ...current,
        applicantCount: applicantCountMap.get(current._id.toString()) || 0,
      };
    });

    res.status(200).json({ jobs: jobsWithApplicantCounts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
