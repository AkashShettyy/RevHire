import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserApplications } from "../services/applicationService";
import { getMyInterviews } from "../services/interviewService";
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
  parttime: "bg-sky-50 text-sky-700",
  internship: "bg-purple-50 text-purple-700",
  remote: "bg-sky-50 text-sky-700",
};

function JobSeekerDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [appsData, interviewsData, jobsData] = await Promise.all([
        getUserApplications(token),
        getMyInterviews(token),
        getAllJobs(),
      ]);
      setApplications(appsData.applications);
      setInterviews(interviewsData.interviews);
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
    { label: "Pending", value: applications.filter((a) => a.status === "applied").length, color: "text-sky-700", bg: "bg-sky-100", icon: "⏳" },
    { label: "Interviews", value: interviews.length, color: "text-violet-700", bg: "bg-violet-100", icon: "🗓️" },
  ];

  if (isLoading)
    return (
      <div className="app-page flex items-center justify-center">
        <div className="flex items-center gap-3 text-stone-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          Loading...
        </div>
      </div>
    );

  return (
    <div className="app-page">
      <div className="app-hero">
        <div className="app-shell flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="app-eyebrow">Job seeker dashboard</span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-950">Good to see you, {user?.name}</h1>
            <p className="mt-2 text-sm text-stone-500">Track applications, monitor activity, and jump back into the search.</p>
          </div>
          <button onClick={() => navigate("/jobs")} className="app-button hidden sm:inline-flex">
            Find Jobs
          </button>
        </div>
      </div>

      <div className="app-shell space-y-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="app-stat">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-stone-500">{s.label}</p>
                  <p className={`mt-3 text-3xl font-bold ${s.color}`}>{s.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${s.bg} text-lg`}>
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Find Jobs", desc: "Browse available openings", icon: "Search", path: "/jobs", color: "from-blue-600 to-blue-700" },
            { label: "My Resume", desc: "Refresh your profile", icon: "Resume", path: "/resume", color: "from-sky-500 to-blue-600" },
            { label: "Applications", desc: "Review recent submissions", icon: "Track", path: "/applications", color: "from-indigo-500 to-blue-700" },
            { label: "Settings", desc: "Update sign-in details", icon: "Account", path: "/settings", color: "from-slate-600 to-slate-800" },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.path)}
              className={`rounded-[28px] bg-gradient-to-br ${a.color} p-5 text-left text-white shadow-xl shadow-stone-900/10 transition-all duration-200 hover:-translate-y-1`}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">{a.icon}</span>
              <p className="font-semibold mt-3">{a.label}</p>
              <p className="text-sm text-white/70 mt-0.5">{a.desc}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="app-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
              <h2 className="font-semibold text-stone-900">Recent Applications</h2>
              <button onClick={() => navigate("/applications")} className="text-sm font-medium text-blue-600 hover:underline">View all</button>
            </div>
            {applications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-3xl mb-3">📭</p>
                <p className="text-sm text-stone-500">No applications yet</p>
                <button onClick={() => navigate("/jobs")} className="app-button mt-4 px-4 py-2">Browse Jobs</button>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {applications.slice(0, 4).map((app) => (
                  <div key={app._id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-stone-900">{app.job?.title}</p>
                      <p className="mt-0.5 text-xs text-stone-400">{app.job?.location} · {new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[app.status]}`}>{app.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="app-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
              <h2 className="font-semibold text-stone-900">Scheduled Interviews</h2>
              <span className="text-sm text-stone-400">{interviews.length} total</span>
            </div>
            {interviews.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-3xl mb-3">🗓️</p>
                <p className="text-sm text-stone-500">No interviews scheduled yet</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {interviews.slice(0, 4).map((interview) => (
                  <div key={interview._id} className="px-6 py-4">
                    <p className="text-sm font-medium text-stone-900">{interview.job?.title}</p>
                    <p className="mt-1 text-xs text-stone-500">{new Date(interview.scheduledAt).toLocaleString()}</p>
                    <p className="mt-1 text-xs text-stone-400">{interview.employer?.name} · {interview.job?.location}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="app-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
              <h2 className="font-semibold text-stone-900">Latest Jobs</h2>
              <button onClick={() => navigate("/jobs")} className="text-sm font-medium text-blue-600 hover:underline">View all</button>
            </div>
            <div className="divide-y divide-stone-100">
              {recentJobs.map((job) => (
                <div key={job._id} onClick={() => navigate(`/jobs/${job._id}`)} className="cursor-pointer px-6 py-4 transition-colors hover:bg-blue-50/60 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-900">{job.title}</p>
                    <p className="mt-0.5 text-xs text-stone-400">{job.employer?.name} · {job.location}</p>
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
