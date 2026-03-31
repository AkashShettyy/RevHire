import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { getEmployerJobs, deleteJob, updateJob, getEmployerAnalytics } from "../../services/jobService";
import { useNavigate } from "react-router-dom";

const jobTypeColors = {
  fulltime: "badge-success",
  parttime: "badge-brand",
  internship: "badge-warning",
  remote: "badge-brand",
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
    { label: "Total Jobs", value: jobs.length, color: "text-brand-700", bg: "bg-brand-50 border border-brand-100", icon: "📋" },
    { label: "Active Jobs", value: jobs.filter((j) => j.status === "open").length, color: "text-success-700", bg: "bg-success-50 border border-success-100", icon: "✅" },
    { label: "Closed Jobs", value: jobs.filter((j) => j.status === "closed").length, color: "text-surface-600", bg: "bg-surface-50 border border-surface-200", icon: "🔒" },
    { label: "Applications", value: analytics?.summary?.totalApplications || 0, color: "text-indigo-700", bg: "bg-indigo-50 border border-indigo-100", icon: "📨" },
    { label: "Shortlisted", value: analytics?.summary?.shortlistedCandidates || 0, color: "text-amber-700", bg: "bg-amber-50 border border-amber-100", icon: "⭐" },
    { label: "Saved by Candidates", value: analytics?.summary?.savedByCandidates || 0, color: "text-pink-700", bg: "bg-pink-50 border border-pink-100", icon: "🔖" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex items-center gap-3 text-surface-500 font-medium font-['Outfit']">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="absolute top-0 right-0 -mr-40 h-[600px] w-[600px] rounded-full bg-brand-300/20 blur-[110px] pointer-events-none"></div>

      <div className="pt-10 pb-10 border-b border-surface-200/60 bg-white/50 backdrop-blur-md relative z-10">
        <div className="layout-container max-w-6xl">
          <div className="page-hero flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow mb-4">
                Employer Dashboard
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-surface-900 sm:text-4xl">
                Welcome, {user?.name}
              </h1>
              <p className="mt-3 max-w-2xl text-[17px] font-medium text-surface-700">
                Manage active roles, applicants, and posting status from one place.
              </p>
            </div>
            <div className="flex flex-col items-end gap-3 text-right">
              {user?.organization && (
                <div className="flex flex-col items-end rounded-2xl border border-brand-100 bg-white/80 px-4 py-2.5 text-[14px] shadow-sm backdrop-blur-sm">
                  <p className="font-bold text-surface-900">{user.organization.name}</p>
                  <p className="mt-0.5 flex items-center gap-2 text-surface-700">
                    Join Code: <span className="select-all rounded border border-brand-100 bg-brand-50 px-2 py-0.5 font-mono font-bold text-brand-700">{user.organization.joinCode}</span>
                  </p>
                </div>
              )}
              <button onClick={() => navigate("/employer/post-job")} className="btn-primary w-full sm:w-auto mt-2">
                Post a Job
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="layout-container max-w-7xl py-14 relative z-10 space-y-12">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="metric-tile">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-widest text-surface-500">{s.label}</p>
                  <p className={`mt-2 text-3xl font-extrabold font-['Outfit'] ${s.color}`}>{s.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${s.bg} text-xl shadow-sm`}>
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {message && (
          <div className="rounded-xl border border-success-200 bg-success-50 p-4 font-semibold text-success-800 shadow-sm animate-fade-in">{message}</div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { label: "Post a Job", desc: "Launch a new opening", path: "/employer/post-job", accent: "bg-brand-100 text-brand-700" },
            { label: "Interview Calendar", desc: "Track scheduled candidate conversations", path: "/interviews", accent: "bg-cyan-100 text-cyan-700" },
            { label: "Notifications", desc: "Review hiring updates", path: "/notifications", accent: "bg-surface-100 text-surface-700" },
          ].map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => navigate(action.path)}
              className="premium-card group relative overflow-hidden border-none p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-8"
            >
              <div className={`absolute right-0 top-0 -mr-4 -mt-4 h-32 w-32 rounded-full opacity-80 blur-2xl transition-transform duration-500 pointer-events-none group-hover:scale-150 ${action.accent.includes("cyan") ? "bg-cyan-100" : action.accent.includes("surface") ? "bg-surface-100" : "bg-brand-100"}`}></div>
              <div className="relative z-10">
                <p className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${action.accent}`}>Quick action</p>
                <p className="mt-5 font-display text-2xl font-bold text-surface-900">{action.label}</p>
                <p className="mt-1.5 text-[15px] font-medium text-surface-700">{action.desc}</p>
                <p className="mt-8 flex items-center gap-2 text-sm font-bold text-brand-700 opacity-90 transition-opacity group-hover:opacity-100">
                  Open workspace <span className="transition-transform group-hover:translate-x-1">→</span>
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Analytics */}
        {analytics && (
          <div className="premium-card bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-surface-900 font-['Outfit']">Hiring Analytics</h2>
                <p className="mt-1 text-[15px] font-medium text-surface-700">Track funnel health across saved jobs, applications, interviews, and hires.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-2">
              {analytics.jobs?.slice(0, 6).map((job) => (
                <div key={job.jobId} className="rounded-2xl border border-surface-200 bg-surface-50/50 p-6 transition-colors hover:bg-white hover:border-brand-200 hover:shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-lg text-surface-900 font-['Outfit']">{job.title}</p>
                      <span className={`mt-2 inline-flex ${job.status === "open" ? "badge-success" : "badge-neutral"}`}>{job.status}</span>
                    </div>
                    <div className="rounded-full border border-surface-200 bg-white px-3 py-1 text-xs font-bold text-surface-600 shadow-sm">
                      {job.applicationCount} apps
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div className="rounded-xl border border-surface-100 bg-white px-4 py-3 shadow-sm">
                      <p className="text-[12px] font-bold uppercase tracking-widest text-surface-400">Saved</p>
                      <p className="mt-1.5 text-xl font-extrabold text-surface-900 font-['Outfit']">{job.savedCount}</p>
                    </div>
                    <div className="rounded-xl border border-surface-100 bg-white px-4 py-3 shadow-sm">
                      <p className="text-[12px] font-bold uppercase tracking-widest text-surface-400">Shortlist Rate</p>
                      <p className="mt-1.5 text-xl font-extrabold text-surface-900 font-['Outfit']">{job.shortlistRate}%</p>
                    </div>
                    <div className="rounded-xl border border-surface-100 bg-white px-4 py-3 shadow-sm">
                      <p className="text-[12px] font-bold uppercase tracking-widest text-surface-400">Interviews</p>
                      <p className="mt-1.5 text-xl font-extrabold text-surface-900 font-['Outfit']">{job.interviewCount}</p>
                    </div>
                    <div className="rounded-xl border border-surface-100 bg-white px-4 py-3 shadow-sm">
                      <p className="text-[12px] font-bold uppercase tracking-widest text-surface-400">Hire Rate</p>
                      <p className="mt-1.5 text-xl font-extrabold text-surface-900 font-['Outfit']">{job.hireRate}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing Jobs */}
        <div>
          <h2 className="mb-6 text-xl font-bold text-surface-900 font-['Outfit']">Your Job Postings</h2>
          {jobs.length === 0 ? (
            <div className="premium-card p-16 text-center bg-white border-none shadow-sm">
              <div className="inline-flex w-24 h-24 rounded-full bg-surface-50 items-center justify-center mb-6">
                <span className="text-4xl">📭</span>
              </div>
              <h3 className="text-2xl font-bold text-surface-900 font-['Outfit'] mb-2">No jobs posted yet</h3>
              <p className="mb-8 mt-1 text-[15px] font-medium text-surface-500">Start attracting candidates by posting your first job.</p>
              <button onClick={() => navigate("/employer/post-job")} className="btn-primary">
                Post Your First Job
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job._id} className="premium-card bg-white p-6 transition-all duration-300 hover:shadow-lg hover:border-brand-200 group relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-400 to-indigo-500 opacity-0 transition-opacity group-hover:opacity-100"></div>
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between ml-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-2">
                        <h3 className="text-xl font-bold text-surface-900 font-['Outfit']">{job.title}</h3>
                        <span className={`badge shrink-0 ${job.status === "open" ? "badge-success" : "badge-neutral"}`}>
                          {job.status === "open" ? "● Active" : "● Closed"}
                        </span>
                        <span className={`badge shrink-0 ${jobTypeColors[job.jobType] || "badge-brand"}`}>{job.jobType}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[14px] font-medium text-surface-500">
                        <span className="flex items-center gap-1.5"><span className="text-surface-400">📍</span> {job.location}</span>
                        <span className="flex items-center gap-1.5"><span className="text-surface-400">📅</span> Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                        {job.salaryRange?.min && (
                           <span className="flex items-center gap-1.5"><span className="text-surface-400">💰</span> ₹{job.salaryRange.min.toLocaleString()} – ₹{job.salaryRange.max?.toLocaleString()}</span>
                        )}
                        <span className="flex items-center gap-1.5 font-bold text-brand-600"><span className="text-brand-400">👥</span> {job.applicantCount || 0} Applicants</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {job.skillsRequired?.slice(0, 5).map((skill, i) => (
                          <span key={i} className="rounded-lg bg-surface-100 border border-surface-200 px-3 py-1.5 text-[12px] font-bold text-surface-600 shadow-sm">{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 xl:flex-col xl:shrink-0 w-full xl:w-56 mt-2 xl:mt-0">
                      <button onClick={() => navigate(`/employer/applicants/${job._id}`)} className="btn-primary w-full text-[14px] py-2.5">
                        View Applicants
                      </button>
                      <button
                        onClick={() => handleToggleStatus(job)}
                        className={`btn-secondary w-full text-[14px] py-2.5 ${job.status === "open" ? "" : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"}`}
                      >
                        {job.status === "open" ? "Close Job" : "Reopen Job"}
                      </button>
                      <button onClick={() => handleDelete(job._id)} className="w-full text-center py-2.5 text-[14px] font-bold text-error-600 border border-error-200 bg-error-50 hover:bg-error-100 transition-colors rounded-xl shadow-sm">
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
