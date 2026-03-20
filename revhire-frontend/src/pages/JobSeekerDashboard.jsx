import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserApplications } from "../services/applicationService";
import { getAllJobs } from "../services/jobService";
import { useNavigate } from "react-router-dom";

const statusColors = {
  applied: "bg-blue-50 text-blue-700 border border-blue-100",
  shortlisted: "bg-green-50 text-green-700 border border-green-100",
  rejected: "bg-red-50 text-red-600 border border-red-100",
  withdrawn: "bg-slate-100 text-slate-500 border border-slate-200",
};

const jobTypeColors = {
  fulltime: "bg-emerald-50 text-emerald-700",
  parttime: "bg-amber-50 text-amber-700",
  internship: "bg-purple-50 text-purple-700",
  remote: "bg-sky-50 text-sky-700",
};

function JobSeekerDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [appsData, jobsData] = await Promise.all([getUserApplications(token), getAllJobs()]);
      setApplications(appsData.applications);
      setRecentJobs(jobsData.jobs.slice(0, 4));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const stats = [
    { label: "Total Applied", value: applications.length, color: "text-blue-700", bg: "bg-blue-100", icon: "📨" },
    { label: "Shortlisted", value: applications.filter((a) => a.status === "shortlisted").length, color: "text-emerald-600", bg: "bg-emerald-100", icon: "✅" },
    { label: "Pending", value: applications.filter((a) => a.status === "applied").length, color: "text-amber-600", bg: "bg-amber-100", icon: "⏳" },
    { label: "Rejected", value: applications.filter((a) => a.status === "rejected").length, color: "text-red-500", bg: "bg-red-100", icon: "❌" },
  ];

  if (isLoading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="page-shell border-b border-white/60 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="section-title text-2xl">Good to see you, {user?.name} 👋</h1>
            <p className="text-slate-500 text-sm mt-1">Here's your job search overview</p>
          </div>
          <button onClick={() => navigate("/jobs")} className="btn-primary hidden sm:flex items-center gap-2">
            <span>🔍</span> Find Jobs
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">{s.label}</p>
                  <p className={`mt-3 text-3xl font-bold ${s.color}`}>{s.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${s.bg} text-lg`}>
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Find Jobs", desc: "Browse latest openings", icon: "🔍", path: "/jobs", color: "from-blue-600 to-blue-700" },
            { label: "My Resume", desc: "Update your resume", icon: "📄", path: "/resume", color: "from-sky-500 to-blue-600" },
            { label: "Applications", desc: "Track your applications", icon: "📋", path: "/applications", color: "from-indigo-500 to-blue-700" },
            { label: "Settings", desc: "Change account password", icon: "⚙️", path: "/settings", color: "from-slate-700 to-slate-900" },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.path)}
              className={`bg-gradient-to-br ${a.color} rounded-2xl p-5 text-left text-white shadow-lg shadow-blue-900/10 transition-all duration-200 hover:-translate-y-1`}
            >
              <span className="text-2xl">{a.icon}</span>
              <p className="font-semibold mt-3">{a.label}</p>
              <p className="text-white/70 text-sm mt-0.5">{a.desc}</p>
            </button>
          ))}
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Recent Applications</h2>
              <button onClick={() => navigate("/applications")} className="text-indigo-600 text-sm font-medium hover:underline">View all</button>
            </div>
            {applications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-3xl mb-3">📭</p>
                <p className="text-slate-500 text-sm">No applications yet</p>
                <button onClick={() => navigate("/jobs")} className="btn-primary mt-4 text-sm px-4 py-2">Browse Jobs</button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {applications.slice(0, 4).map((app) => (
                  <div key={app._id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{app.job?.title}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{app.job?.location} · {new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[app.status]}`}>{app.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Jobs */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Latest Jobs</h2>
              <button onClick={() => navigate("/jobs")} className="text-indigo-600 text-sm font-medium hover:underline">View all</button>
            </div>
            <div className="divide-y divide-slate-100">
              {recentJobs.map((job) => (
                <div key={job._id} onClick={() => navigate(`/jobs/${job._id}`)} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{job.title}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{job.employer?.name} · {job.location}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${jobTypeColors[job.jobType]}`}>{job.jobType}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobSeekerDashboard;
