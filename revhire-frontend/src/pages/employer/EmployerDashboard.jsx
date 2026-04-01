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
    { label: "Total Jobs", value: jobs.length, accent: "from-brand-400 to-brand-600" },
    { label: "Active Jobs", value: jobs.filter((j) => j.status === "open").length, accent: "from-emerald-400 to-emerald-600" },
    { label: "Closed Jobs", value: jobs.filter((j) => j.status === "closed").length, accent: "from-surface-400 to-surface-600" },
    { label: "Applications", value: analytics?.summary?.totalApplications || 0, accent: "from-cyan-400 to-cyan-600" },
    { label: "Shortlisted", value: analytics?.summary?.shortlistedCandidates || 0, accent: "from-amber-400 to-amber-600" },
    { label: "Saved by Candidates", value: analytics?.summary?.savedByCandidates || 0, accent: "from-indigo-400 to-indigo-600" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex items-center gap-3 text-surface-500 font-medium font-display">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="pt-8 pb-6 border-b border-surface-200/60 bg-white relative z-10">
        <div className="layout-container max-w-6xl">
          <div className="section-card border-brand-100 bg-gradient-to-br from-white via-brand-50/40 to-cyan-50/30 px-6 py-6 sm:px-8">
            <div className="grid gap-6 md:grid-cols-[1.2fr,0.8fr] md:items-end">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-surface-900 sm:text-3xl">Employer Dashboard</h1>
                <p className="mt-2 max-w-2xl text-sm text-surface-700">Manage active roles, applicants, and hiring status.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button onClick={() => navigate("/employer/post-job")} className="btn-primary">Post a Job</button>
                  <button onClick={() => navigate("/interviews")} className="btn-secondary">Interviews</button>
                  <button onClick={() => navigate("/notifications")} className="btn-secondary">Notifications</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-surface-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-medium text-surface-500">Open Roles</p>
                  <p className="mt-1 text-2xl font-semibold text-surface-900">{jobs.filter((j) => j.status === "open").length}</p>
                </div>
                <div className="rounded-xl border border-surface-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-medium text-surface-500">Applications</p>
                  <p className="mt-1 text-2xl font-semibold text-surface-900">{analytics?.summary?.totalApplications || 0}</p>
                </div>
              </div>
              {user?.organization && (
                <div className="rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm text-surface-700 shadow-sm md:col-span-2">
                  <p className="font-semibold text-surface-900">{user.organization.name}</p>
                  <p className="mt-1">Join code: <span className="font-mono font-semibold text-brand-700">{user.organization.joinCode}</span></p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="layout-container max-w-7xl py-14 relative z-10 space-y-12">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-display font-bold text-surface-900">Overview</h2>
            <span className="text-sm text-surface-500">Recruiting summary</span>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="metric-tile relative overflow-hidden border-surface-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${s.accent}`} />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-normal text-surface-500">{s.label}</p>
                  <p className="mt-2 text-3xl font-semibold font-display text-surface-900">{s.value}</p>
                </div>
                <span className="rounded-full border border-surface-200 bg-surface-50 px-2.5 py-1 text-[11px] font-medium text-surface-500">Live</span>
              </div>
            </div>
          ))}
          </div>
        </div>

        {message && (
          <div className="rounded-xl border border-success-200 bg-success-50 p-4 font-semibold text-success-800 shadow-sm animate-fade-in">{message}</div>
        )}

        {/* Analytics */}
        {analytics && (
          <div className="premium-card bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-surface-900 font-display">Hiring Analytics</h2>
                <p className="mt-1 text-[15px] font-medium text-surface-700">Track funnel health across saved jobs, applications, interviews, and hires.</p>
              </div>
              <span className="badge badge-neutral">{analytics.jobs?.length || 0} roles</span>
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-2">
              {analytics.jobs?.slice(0, 6).map((job) => (
                <div key={job.jobId} className="rounded-2xl border border-surface-200 bg-surface-50/50 p-6 transition-colors hover:bg-white hover:border-brand-200 hover:shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-lg text-surface-900 font-display">{job.title}</p>
                      <span className={`mt-2 inline-flex ${job.status === "open" ? "badge-success" : "badge-neutral"}`}>{job.status}</span>
                    </div>
                    <div className="rounded-full border border-surface-200 bg-white px-3 py-1 text-xs font-bold text-surface-600 shadow-sm">
                      {job.applicationCount} apps
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div className="rounded-xl border border-surface-100 bg-white px-4 py-3 shadow-sm">
                      <p className="text-[12px] font-bold uppercase tracking-normal text-surface-400">Saved</p>
                      <p className="mt-1.5 text-xl font-semibold text-surface-900 font-display">{job.savedCount}</p>
                    </div>
                    <div className="rounded-xl border border-surface-100 bg-white px-4 py-3 shadow-sm">
                      <p className="text-[12px] font-bold uppercase tracking-normal text-surface-400">Shortlist Rate</p>
                      <p className="mt-1.5 text-xl font-semibold text-surface-900 font-display">{job.shortlistRate}%</p>
                    </div>
                    <div className="rounded-xl border border-surface-100 bg-white px-4 py-3 shadow-sm">
                      <p className="text-[12px] font-bold uppercase tracking-normal text-surface-400">Interviews</p>
                      <p className="mt-1.5 text-xl font-semibold text-surface-900 font-display">{job.interviewCount}</p>
                    </div>
                    <div className="rounded-xl border border-surface-100 bg-white px-4 py-3 shadow-sm">
                      <p className="text-[12px] font-bold uppercase tracking-normal text-surface-400">Hire Rate</p>
                      <p className="mt-1.5 text-xl font-semibold text-surface-900 font-display">{job.hireRate}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing Jobs */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-surface-900 font-display">Your Job Postings</h2>
            <span className="text-sm text-surface-500">{jobs.length} total</span>
          </div>
          {jobs.length === 0 ? (
            <div className="premium-card p-16 text-center bg-white border-none shadow-sm">
              <h3 className="text-2xl font-bold text-surface-900 font-display mb-2">No jobs posted yet</h3>
              <p className="mb-8 mt-1 text-[15px] font-medium text-surface-500">Start attracting candidates by posting your first job.</p>
              <button onClick={() => navigate("/employer/post-job")} className="btn-primary">
                Post Your First Job
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job._id} className="premium-card bg-white p-6 transition-all duration-300 hover:border-brand-200 group">
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-2">
                        <h3 className="text-xl font-bold text-surface-900 font-display">{job.title}</h3>
                        <span className={`badge shrink-0 ${job.status === "open" ? "badge-success" : "badge-neutral"}`}>
                          {job.status === "open" ? "Active" : "Closed"}
                        </span>
                        <span className={`badge shrink-0 ${jobTypeColors[job.jobType] || "badge-brand"}`}>{job.jobType}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[14px] font-medium text-surface-500">
                        <span><span className="font-semibold text-surface-700">Location:</span> {job.location}</span>
                        <span><span className="font-semibold text-surface-700">Deadline:</span> {new Date(job.deadline).toLocaleDateString()}</span>
                        {job.salaryRange?.min && (
                           <span><span className="font-semibold text-surface-700">Salary:</span> ₹{job.salaryRange.min.toLocaleString()} – ₹{job.salaryRange.max?.toLocaleString()}</span>
                        )}
                        <span className="font-semibold text-brand-700">{job.applicantCount || 0} Applicants</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {job.skillsRequired?.slice(0, 5).map((skill, i) => (
                          <span key={i} className="rounded-md bg-surface-100 border border-surface-200 px-3 py-1.5 text-[12px] font-medium text-surface-600">{skill}</span>
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
                      <button onClick={() => handleDelete(job._id)} className="w-full rounded-lg border border-error-200 bg-error-50 py-2.5 text-center text-[14px] font-medium text-error-700 transition-colors hover:bg-error-100">
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
