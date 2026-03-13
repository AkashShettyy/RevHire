import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById } from "../services/jobService";
import { applyForJob } from "../services/applicationService";
import { useAuth } from "../context/AuthContext";

function JobDetails() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  async function fetchJob() {
    try {
      const data = await getJobById(id);
      setJob(data.job);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleApply(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await applyForJob(id, { coverLetter }, token);
      setMessage("Applied successfully! ✅");
      setIsApplied(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  if (!job)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );

  const jobTypeColors = {
    fulltime: "bg-green-100 text-green-700",
    parttime: "bg-yellow-100 text-yellow-700",
    internship: "bg-purple-100 text-purple-700",
    remote: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate("/jobs")}
          className="text-primary hover:underline text-sm mb-6 flex items-center gap-1"
        >
          ← Back to Jobs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {job.title}
                  </h1>
                  <p className="text-gray-500 mt-1">{job.employer?.name}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${jobTypeColors[job.jobType]}`}
                >
                  {job.jobType}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                <span>📍 {job.location}</span>
                <span>
                  💰 ₹{job.salaryRange?.min?.toLocaleString()} - ₹
                  {job.salaryRange?.max?.toLocaleString()}
                </span>
                <span>
                  📅 Deadline: {new Date(job.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Job Description
              </h2>
              <p className="text-gray-600 leading-relaxed">{job.description}</p>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Skills Required
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired?.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Requirements
              </h2>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Experience:</span>{" "}
                  {job.experienceRequired}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Education:</span>{" "}
                  {job.educationRequired}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar — Apply */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-20">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Apply for this job
              </h2>

              {job.status === "closed" ? (
                <div className="bg-red-50 text-red-500 px-4 py-3 rounded-lg text-sm text-center">
                  This job is closed
                </div>
              ) : user?.role === "jobseeker" ? (
                isApplied ? (
                  <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm text-center font-medium">
                    ✅ Applied Successfully!
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="space-y-4">
                    <textarea
                      placeholder="Write a cover letter (optional)"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                    />
                    {message && (
                      <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
                        {message}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition-colors disabled:opacity-50"
                    >
                      {isLoading ? "Applying..." : "Apply Now"}
                    </button>
                  </form>
                )
              ) : (
                <p className="text-gray-500 text-sm text-center">
                  Login as a job seeker to apply
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetails;
