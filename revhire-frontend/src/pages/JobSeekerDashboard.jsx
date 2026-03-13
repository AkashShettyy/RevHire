import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserApplications } from "../services/applicationService";
import { getAllJobs } from "../services/jobService";
import { useNavigate } from "react-router-dom";

function JobSeekerDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [appsData, jobsData] = await Promise.all([
        getUserApplications(token),
        getAllJobs(),
      ]);
      setApplications(appsData.applications);
      setRecentJobs(jobsData.jobs.slice(0, 4));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const stats = {
    total: applications.length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    applied: applications.filter((a) => a.status === "applied").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const statusColors = {
    applied: "bg-blue-100 text-blue-700",
    shortlisted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    withdrawn: "bg-gray-100 text-gray-600",
  };

  const jobTypeColors = {
    fulltime: "bg-green-100 text-green-700",
    parttime: "bg-yellow-100 text-yellow-700",
    internship: "bg-purple-100 text-purple-700",
    remote: "bg-blue-100 text-blue-700",
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.name}
          </h1>
          <p className="text-slate-500 mt-2">Here&apos;s your job search overview</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Applied",
              value: stats.total,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Shortlisted",
              value: stats.shortlisted,
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              label: "Pending",
              value: stats.applied,
              color: "text-yellow-600",
              bg: "bg-yellow-50",
            },
            {
              label: "Rejected",
              value: stats.rejected,
              color: "text-red-600",
              bg: "bg-red-50",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-5 shadow-sm border border-slate-200"
            >
              <p className="text-slate-500 text-sm">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">
                Recent Applications
              </h2>
              <button
                onClick={() => navigate("/applications")}
                className="text-primary text-sm hover:underline"
              >
                View all
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {applications.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-slate-400 text-sm">No applications yet</p>
                  <button
                    onClick={() => navigate("/jobs")}
                    className="mt-3 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                  >
                    Find Jobs
                  </button>
                </div>
              ) : (
                applications.slice(0, 4).map((app) => (
                  <div key={app._id} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-900 text-sm">
                          {app.job?.title}
                        </p>
                        <p className="text-slate-400 text-xs mt-1">
                          {app.job?.location} •{" "}
                          {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[app.status]}`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Recent Jobs</h2>
              <button
                onClick={() => navigate("/jobs")}
                className="text-primary text-sm hover:underline"
              >
                View all
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {recentJobs.map((job) => (
                <div
                  key={job._id}
                  onClick={() => navigate(`/jobs/${job._id}`)}
                  className="px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">
                        {job.title}
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        {job.employer?.name} • {job.location}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${jobTypeColors[job.jobType]}`}
                    >
                      {job.jobType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {[
            {
              label: "Find Jobs",
              desc: "Browse latest openings",
              icon: "🔍",
              path: "/jobs",
              color: "bg-blue-50 border-blue-100",
            },
            {
              label: "My Resume",
              desc: "Update your resume",
              icon: "📄",
              path: "/resume",
              color: "bg-green-50 border-green-100",
            },
            {
              label: "Applications",
              desc: "Track your applications",
              icon: "📋",
              path: "/applications",
              color: "bg-purple-50 border-purple-100",
            },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className={`${action.color} border rounded-xl p-5 text-left hover:shadow-md transition-all`}
            >
              <span className="text-2xl">{action.icon}</span>
              <p className="font-semibold text-gray-900 mt-2">{action.label}</p>
              <p className="text-gray-500 text-sm mt-1">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default JobSeekerDashboard;
