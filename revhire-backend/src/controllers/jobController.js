import Job from "../models/Job.js";
import Organization from "../models/Organization.js";
import Application from "../models/Application.js";
import Interview from "../models/Interview.js";
import SavedJob from "../models/SavedJob.js";
import { getAccessibleOrganizationIds, canAccessOrganization } from "../utils/organizationAccess.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
    const {
      search,
      location,
      jobType,
      experience,
      company,
      salaryMin,
      salaryMax,
      skills,
      daysPosted,
      sortBy = "newest",
      page = 1,
      limit = 9,
    } = req.query;

    let filter = { status: "open" };
    const currentPage = Math.max(Number(page) || 1, 1);
    const parsedLimit = Math.min(Math.max(Number(limit) || 9, 1), 24);

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
    if (salaryMin) filter["salaryRange.max"] = { $gte: Number(salaryMin) };
    if (salaryMax) filter["salaryRange.min"] = { $lte: Number(salaryMax) };

    if (skills) {
      const requestedSkills = String(skills)
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      if (requestedSkills.length > 0) {
        filter.skillsRequired = {
          $all: requestedSkills.map((skill) => new RegExp(escapeRegex(skill), "i")),
        };
      }
    }

    if (daysPosted) {
      const postedWindow = Number(daysPosted);
      if (!Number.isNaN(postedWindow) && postedWindow > 0) {
        filter.createdAt = {
          $gte: new Date(Date.now() - postedWindow * 24 * 60 * 60 * 1000),
        };
      }
    }

    if (company) {
      const matchedOrgs = await Organization.find({ name: { $regex: company, $options: "i" } }).select('_id');
      const orgIds = matchedOrgs.map(org => org._id);
      filter.organization = { $in: orgIds };
    }

    const sortMap = {
      newest: { createdAt: -1 },
      deadline: { deadline: 1, createdAt: -1 },
      salary_high: { "salaryRange.max": -1, createdAt: -1 },
      salary_low: { "salaryRange.min": 1, createdAt: -1 },
    };

    const [jobs, total] = await Promise.all([
      Job.find(filter)
      .populate("organization", "name joinCode")
      .sort(sortMap[sortBy] || sortMap.newest)
      .skip((currentPage - 1) * parsedLimit)
      .limit(parsedLimit),
      Job.countDocuments(filter),
    ]);

    res.status(200).json({
      jobs,
      pagination: {
        total,
        page: currentPage,
        limit: parsedLimit,
        totalPages: Math.max(Math.ceil(total / parsedLimit), 1),
      },
    });
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

export const getEmployerAnalytics = async (req, res) => {
  try {
    const accessibleOrganizationIds = await getAccessibleOrganizationIds(
      req.user.organizationId,
    );

    const jobs = await Job.find({
      organization: { $in: accessibleOrganizationIds },
    })
      .select("_id title status createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const jobIds = jobs.map((job) => job._id);

    const [applications, interviews, savedCounts] = await Promise.all([
      Application.find({ job: { $in: jobIds } }).select("job status createdAt").lean(),
      Interview.find({ job: { $in: jobIds } }).select("job status responseStatus").lean(),
      SavedJob.aggregate([
        { $match: { job: { $in: jobIds } } },
        { $group: { _id: "$job", count: { $sum: 1 } } },
      ]),
    ]);

    const savedCountMap = new Map(savedCounts.map((entry) => [entry._id.toString(), entry.count]));

    const summary = {
      totalJobs: jobs.length,
      openJobs: jobs.filter((job) => job.status === "open").length,
      totalApplications: applications.length,
      shortlistedCandidates: applications.filter((application) => application.status === "shortlisted").length,
      interviewingCandidates: applications.filter((application) => application.status === "interviewing").length,
      hiredCandidates: applications.filter((application) => application.status === "hired").length,
      savedByCandidates: savedCounts.reduce((sum, entry) => sum + entry.count, 0),
    };

    const applicationsByJob = new Map();
    for (const application of applications) {
      const jobId = application.job.toString();
      if (!applicationsByJob.has(jobId)) {
        applicationsByJob.set(jobId, []);
      }
      applicationsByJob.get(jobId).push(application);
    }

    const interviewsByJob = new Map();
    for (const interview of interviews) {
      const jobId = interview.job.toString();
      if (!interviewsByJob.has(jobId)) {
        interviewsByJob.set(jobId, []);
      }
      interviewsByJob.get(jobId).push(interview);
    }

    const jobAnalytics = jobs.map((job) => {
      const jobId = job._id.toString();
      const jobApplications = applicationsByJob.get(jobId) || [];
      const jobInterviews = interviewsByJob.get(jobId) || [];
      const shortlisted = jobApplications.filter((application) => application.status === "shortlisted").length;
      const interviewing = jobApplications.filter((application) => application.status === "interviewing").length;
      const hired = jobApplications.filter((application) => application.status === "hired").length;

      return {
        jobId,
        title: job.title,
        status: job.status,
        applicationCount: jobApplications.length,
        savedCount: savedCountMap.get(jobId) || 0,
        shortlistedCount: shortlisted,
        interviewingCount: interviewing,
        hiredCount: hired,
        interviewCount: jobInterviews.length,
        acceptedInterviewCount: jobInterviews.filter((interview) => interview.responseStatus === "accepted").length,
        shortlistRate: jobApplications.length > 0 ? Math.round((shortlisted / jobApplications.length) * 100) : 0,
        hireRate: jobApplications.length > 0 ? Math.round((hired / jobApplications.length) * 100) : 0,
      };
    });

    res.status(200).json({
      summary,
      jobs: jobAnalytics,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
