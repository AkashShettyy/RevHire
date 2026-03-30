import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { getEmployerJobs, deleteJob, updateJob, getEmployerAnalytics } from "../../services/jobService";
import { useNavigate } from "react-router-dom";

const jobTypeColors = {
  fulltime: "bg-emerald-50 text-emerald-700",
  parttime: "bg-sky-50 text-sky-700",
  internship: "bg-purple-50 text-purple-700",
  remote: "bg-sky-50 text-sky-700",
};

function EmployerDashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const [jobsData, analyticsData] = await Promise.all([
        getEmployerJobs(token),
        getEmployerAnalytics(token),
      ]);
      setJobs(jobsData.jobs);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  async function handleDelete(id) {
    if (!window.confirm("Delete this job posting?")) return;
    try {
      await deleteJob(id, token);
      setMessage("Job deleted successfully");
      fetchJobs();
    } catch {
      setMessage("Something went wrong");
    }
  }

  async function handleToggleStatus(job) {
    try {
      await updateJob(job._id, { status: job.status === "open" ? "closed" : "open" }, token);
      setMessage(`Job ${job.status === "open" ? "closed" : "reopened"}`);
      setTimeout(() => setMessage(""), 3000);
      fetchJobs();
    } catch {
      setMessage("Something went wrong");
    }
  }

  const stats = [
    { label: "Total Jobs", value: jobs.length, color: "text-blue-700", bg: "bg-blue-100", icon: "📋" },
    { label: "Active Jobs", value: jobs.filter((j) => j.status === "open").length, color: "text-emerald-600", bg: "bg-emerald-100", icon: "✅" },
    { label: "Closed Jobs", value: jobs.filter((j) => j.status === "closed").length, color: "text-slate-500", bg: "bg-slate-100", icon: "🔒" },
    { label: "Applications", value: analytics?.summary?.totalApplications || 0, color: "text-indigo-700", bg: "bg-indigo-100", icon: "📨" },
    { label: "Shortlisted", value: analytics?.summary?.shortlistedCandidates || 0, color: "text-amber-700", bg: "bg-amber-100", icon: "⭐" },
    { label: "Saved by Candidates", value: analytics?.summary?.savedByCandidates || 0, color: "text-pink-700", bg: "bg-pink-100", icon: "🔖" },
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
            <span className="app-eyebrow">Employer dashboard</span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-950">Welcome, {user?.name}</h1>
            <p className="mt-2 text-sm text-stone-500">Manage active roles, applicants, and posting status from one place.</p>
          </div>
          <div className="flex flex-col items-end gap-3 text-right">
            {user?.organization && (
               <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl text-sm">
                 <p className="font-bold text-blue-900">{user.organization.name}</p>
                 <p className="text-blue-700 flex items-center gap-2">Join Code: <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200 select-all tracking-wider font-semibold">{user.organization.joinCode}</span></p>
               </div>
            )}
            <button onClick={() => navigate("/employer/post-job")} className="app-button w-full sm:w-auto">
              Post a Job
            </button>
          </div>
        </div>
      </div>

      <div className="app-shell space-y-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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

        {message && (
          <div className="app-message-success">{message}</div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { label: "Post a Job", desc: "Launch a new opening", path: "/employer/post-job", color: "from-blue-500 to-blue-700" },
            { label: "Interview Calendar", desc: "Track scheduled candidate conversations", path: "/interviews", color: "from-violet-500 to-indigo-700" },
            { label: "Notifications", desc: "Review hiring updates", path: "/notifications", color: "from-slate-700 to-slate-900" },
          ].map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => navigate(action.path)}
              className={`app-action-card bg-gradient-to-br ${action.color}`}
            >
              <div className="relative z-[1]">
                <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/75">Quick action</p>
                <p className="mt-4 text-lg font-semibold">{action.label}</p>
                <p className="mt-1 text-sm text-white/72">{action.desc}</p>
                <p className="mt-6 text-sm font-semibold text-white">Open workspace →</p>
              </div>
            </button>
          ))}
        </div>

        {analytics && (
          <div className="app-panel p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-stone-900">Hiring Analytics</h2>
                <p className="mt-1 text-sm text-stone-500">Track funnel health across saved jobs, applications, interviews, and hires.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {analytics.jobs?.slice(0, 6).map((job) => (
                <div key={job.jobId} className="rounded-3xl border border-stone-200 bg-stone-50/70 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-stone-900">{job.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-400">{job.status}</p>
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-stone-600">
                      {job.applicationCount} apps
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-white px-3 py-3">
                      <p className="text-stone-400">Saved</p>
                      <p className="mt-1 font-semibold text-stone-900">{job.savedCount}</p>
                    </div>
                    <div className="rounded-2xl bg-white px-3 py-3">
                      <p className="text-stone-400">Shortlist Rate</p>
                      <p className="mt-1 font-semibold text-stone-900">{job.shortlistRate}%</p>
                    </div>
                    <div className="rounded-2xl bg-white px-3 py-3">
                      <p className="text-stone-400">Interviews</p>
                      <p className="mt-1 font-semibold text-stone-900">{job.interviewCount}</p>
                    </div>
                    <div className="rounded-2xl bg-white px-3 py-3">
                      <p className="text-stone-400">Hire Rate</p>
                      <p className="mt-1 font-semibold text-stone-900">{job.hireRate}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="mb-4 font-semibold text-stone-900">Your Job Postings</h2>
          {jobs.length === 0 ? (
            <div className="app-empty">
              <p className="text-4xl mb-4">📭</p>
              <p className="font-medium text-stone-700">No jobs posted yet</p>
              <p className="mb-6 mt-1 text-sm text-stone-400">Start attracting candidates by posting your first job</p>
              <button onClick={() => navigate("/employer/post-job")} className="app-button">Post Your First Job</button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job._id} className="app-panel p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-stone-900">{job.title}</h3>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${job.status === "open" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                          {job.status === "open" ? "● Active" : "● Closed"}
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${jobTypeColors[job.jobType]}`}>{job.jobType}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-stone-500">
                        <span>📍 {job.location}</span>
                        <span>📅 Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                        {job.salaryRange?.min && <span>💰 ₹{job.salaryRange.min.toLocaleString()} – ₹{job.salaryRange.max?.toLocaleString()}</span>}
                        <span>👥 Applicants: {job.applicantCount || 0}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {job.skillsRequired?.slice(0, 4).map((skill, i) => (
                          <span key={i} className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600">{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 xl:flex-col xl:shrink-0">
                      <button onClick={() => navigate(`/employer/applicants/${job._id}`)} className="app-button whitespace-nowrap px-4 py-2">
                        View Applicants ({job.applicantCount || 0})
                      </button>
                      <button
                        onClick={() => handleToggleStatus(job)}
                        className={`whitespace-nowrap rounded-2xl border px-4 py-2 text-sm font-semibold transition-colors ${job.status === "open" ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100" : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"}`}
                      >
                        {job.status === "open" ? "Close Job" : "Reopen Job"}
                      </button>
                      <button onClick={() => handleDelete(job._id)} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-100">
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
    </div>
  );
}

export default EmployerDashboard;
