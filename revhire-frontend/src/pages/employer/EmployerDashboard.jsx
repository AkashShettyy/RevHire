import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getEmployerJobs,
  deleteJob,
  updateJob,
} from "../../services/jobService";
import { useNavigate } from "react-router-dom";

function EmployerDashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    setIsLoading(true);
    try {
      const data = await getEmployerJobs(token);
      setJobs(data.jobs);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await deleteJob(id, token);
      setMessage("Job deleted ✅");
      fetchJobs();
    } catch (error) {
      setMessage("Something went wrong");
    }
  }

  async function handleToggleStatus(job) {
    try {
      await updateJob(
        job._id,
        {
          status: job.status === "open" ? "closed" : "open",
        },
        token,
      );
      setMessage(`Job ${job.status === "open" ? "closed" : "reopened"} ✅`);
      fetchJobs();
    } catch (error) {
      setMessage("Something went wrong");
    }
  }

  const stats = {
    total: jobs.length,
    open: jobs.filter((j) => j.status === "open").length,
    closed: jobs.filter((j) => j.status === "closed").length,
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.name}! 👋</h1>
            <p className="text-blue-100 mt-1">Manage your job postings</p>
          </div>
          <button
            onClick={() => navigate("/employer/post-job")}
            className="bg-white text-primary px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            + Post a Job
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Jobs", value: stats.total, color: "text-blue-600" },
            { label: "Active", value: stats.open, color: "text-green-600" },
            { label: "Closed", value: stats.closed, color: "text-gray-500" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center"
            >
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {message && (
          <p className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {message}
          </p>
        )}

        {/* Job List */}
        <h2 className="font-semibold text-gray-900 mb-4">Your Job Postings</h2>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-500">No jobs posted yet</p>
            <button
              onClick={() => navigate("/employer/post-job")}
              className="mt-4 bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-secondary transition-colors"
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">
                        {job.title}
                      </h3>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          job.status === "open"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      <span>📍 {job.location}</span>
                      <span>💼 {job.jobType}</span>
                      <span>
                        📅 Deadline:{" "}
                        {new Date(job.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {job.skillsRequired?.slice(0, 3).map((skill, i) => (
                        <span
                          key={i}
                          className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() =>
                        navigate(`/employer/applicants/${job._id}`)
                      }
                      className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-colors whitespace-nowrap"
                    >
                      View Applicants
                    </button>
                    <button
                      onClick={() => handleToggleStatus(job)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                        job.status === "open"
                          ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {job.status === "open" ? "Close Job" : "Reopen Job"}
                    </button>
                    <button
                      onClick={() => handleDelete(job._id)}
                      className="bg-red-50 text-red-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployerDashboard;
