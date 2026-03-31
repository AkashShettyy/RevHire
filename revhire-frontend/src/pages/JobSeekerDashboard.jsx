import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserApplications } from "../services/applicationService";
import { getMyInterviews, respondToInterview } from "../services/interviewService";
import { getAllJobs } from "../services/jobService";
import { getJobAlerts, getSavedJobs } from "../services/savedJobService";
import { useNavigate } from "react-router-dom";

const statusColors = {
  applied: "badge-brand",
  shortlisted: "badge-success",
  rejected: "badge-error",
  withdrawn: "badge-neutral",
};

const jobTypeColors = {
  fulltime: "badge-success",
  parttime: "badge-brand",
  internship: "badge-warning",
  remote: "badge-brand",
};

function getInterviewTimestamp(value) {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function JobSeekerDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [jobAlerts, setJobAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const authToken = token || null;

  const fetchData = useCallback(async (activeToken) => {
    if (!activeToken) return;
    setIsLoading(true);
    try {
      const [appsData, interviewsData, jobsData] = await Promise.all([
        getUserApplications(activeToken),
        getMyInterviews(activeToken),
        getAllJobs(),
      ]);
      setApplications(appsData.applications);
      setInterviews(interviewsData.interviews);
      setRecentJobs(jobsData.jobs.slice(0, 4));

      const [savedData, alertsData] = await Promise.allSettled([
        getSavedJobs(activeToken),
        getJobAlerts(activeToken),
      ]);

      if (savedData.status === "fulfilled") {
        setSavedJobs(savedData.value.savedJobs || []);
      }

      if (alertsData.status === "fulfilled") {
        setJobAlerts(alertsData.value.alerts || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authToken) {
      fetchData(authToken);
    }
  }, [authToken, fetchData]);

  async function handleInterviewResponse(interviewId, responseStatus) {
    try {
      await respondToInterview(interviewId, responseStatus, token);
      setMessage(`Interview ${responseStatus}`);
      setTimeout(() => setMessage(""), 3000);
      fetchData(authToken);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  }

  const stats = [
    { label: "Total Applied", value: applications.length, color: "text-brand-700", bg: "bg-brand-100", icon: "📨" },
    { label: "Shortlisted", value: applications.filter((a) => a.status === "shortlisted").length, color: "text-success-600", bg: "bg-success-100", icon: "✅" },
    { label: "Pending", value: applications.filter((a) => a.status === "applied").length, color: "text-blue-700", bg: "bg-blue-100", icon: "⏳" },
    { label: "Interviews", value: interviews.length, color: "text-purple-700", bg: "bg-purple-100", icon: "🗓️" },
  ];

  const now = Date.now();
  const normalizedInterviews = interviews
    .map((interview) => ({
      ...interview,
      scheduledTimestamp: getInterviewTimestamp(interview.scheduledAt),
    }))
    .filter((interview) => interview.scheduledTimestamp !== null)
    .sort((a, b) => a.scheduledTimestamp - b.scheduledTimestamp);
  const upcomingInterviews = normalizedInterviews.filter((interview) => interview.scheduledTimestamp >= now);
  const pastInterviews = normalizedInterviews.filter((interview) => interview.scheduledTimestamp < now);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex items-center gap-3 text-surface-500 font-medium font-['Outfit']">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          Loading...
        </div>
      </div>
    );

  return (
    <div className="app-shell">
      <div className="absolute top-0 right-0 -mr-40 h-[500px] w-full bg-brand-200/20 blur-[120px] pointer-events-none"></div>

      <div className="pt-10 pb-8 border-b border-surface-200/60 bg-white/40 backdrop-blur-md">
        <div className="layout-container mx-auto max-w-6xl">
          <div className="page-hero flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between relative z-10">
            <div>
              <span className="eyebrow mb-4">
                Job Seeker Dashboard
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-surface-900 sm:text-4xl">Good to see you, {user?.name}</h1>
              <p className="mt-3 text-[17px] font-medium text-surface-700">Track applications, upcoming interviews, and recent activity from one place.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="layout-container mx-auto max-w-7xl space-y-10 py-14 relative z-10">
        {message && (
          <div className="rounded-xl border border-success-200 bg-success-50 p-4 font-semibold text-success-800 shadow-sm transition-all duration-300">
            {message.charAt(0).toUpperCase() + message.slice(1)}
          </div>
        )}

        <div className="stat-grid">
          {stats.map((s) => (
            <div key={s.label} className="metric-tile hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-widest text-surface-400">{s.label}</p>
                  <p className={`mt-2 text-3xl font-extrabold font-['Outfit'] ${s.color}`}>{s.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${s.bg} text-xl shadow-inner`}>
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { label: "My Resume", desc: "Refresh your profile", icon: "Resume", path: "/resume", accent: "bg-brand-100 text-brand-700" },
            { label: "Saved Jobs", desc: "Track interesting roles", icon: "Saved", path: "/saved-jobs", accent: "bg-amber-100 text-amber-700" },
            { label: "Applications", desc: "Review recent submissions", icon: "Track", path: "/applications", accent: "bg-sky-100 text-sky-700" },
            { label: "Interview Calendar", desc: "Manage upcoming conversations", icon: "Calendar", path: "/interviews", accent: "bg-teal-100 text-teal-700" },
            { label: "Settings", desc: "Update sign-in details", icon: "Account", path: "/settings", accent: "bg-surface-100 text-surface-700" },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.path)}
              className="premium-card group relative overflow-hidden p-7 text-left shadow-md shadow-brand-500/10 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl ${a.accent.includes("amber") ? "bg-amber-100/80" : a.accent.includes("sky") ? "bg-sky-100/80" : a.accent.includes("teal") ? "bg-teal-100/80" : "bg-brand-100/70"}`}></div>
              <div className="relative z-10">
                <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${a.accent}`}>{a.icon}</span>
                <p className="mt-5 font-display text-xl font-bold text-surface-900">{a.label}</p>
                <p className="mt-1.5 text-sm font-medium text-surface-700">{a.desc}</p>
                <div className="mt-6 flex items-center text-sm font-bold text-brand-700 transition-colors group-hover:text-brand-800">
                  Open workspace 
                  <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="premium-card bg-white shadow-sm flex flex-col h-full border-surface-200">
            <div className="flex border-b border-surface-100 bg-surface-50/50 px-6 py-5 items-center justify-between">
              <h2 className="text-lg font-bold text-surface-900 font-['Outfit']">Recent Applications</h2>
              <button onClick={() => navigate("/applications")} className="text-[13px] font-bold text-brand-600 hover:text-brand-700 transition-colors">View all</button>
            </div>
            <div className="flex-1 overflow-auto">
              {applications.length === 0 ? (
                <div className="px-6 py-12 text-center h-full flex flex-col justify-center">
                  <p className="mb-4 text-4xl">📭</p>
                  <p className="text-[15px] font-medium text-surface-500">No applications yet</p>
                  <button onClick={() => navigate("/jobs")} className="btn-secondary mt-5 mx-auto">Browse Jobs</button>
                </div>
              ) : (
                <div className="divide-y divide-surface-100">
                  {applications.slice(0, 4).map((app) => (
                    <div key={app._id} className="flex items-center justify-between px-6 py-4 hover:bg-surface-50/50 transition-colors">
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="text-[15px] font-bold text-surface-800 truncate">{app.job?.title}</p>
                        <p className="mt-1 text-[13px] font-medium text-surface-500 truncate">{app.job?.location} · {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`badge shrink-0 ${statusColors[app.status]}`}>{app.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="premium-card bg-white shadow-sm flex flex-col h-full border-surface-200">
            <div className="flex items-center justify-between border-b border-surface-100 bg-surface-50/50 px-6 py-5">
              <h2 className="text-lg font-bold text-surface-900 font-['Outfit']">Upcoming Interviews</h2>
              <span className="badge badge-brand">{upcomingInterviews.length} total</span>
            </div>
            <div className="flex-1 overflow-auto">
              {upcomingInterviews.length === 0 ? (
                <div className="px-6 py-12 text-center h-full flex flex-col justify-center">
                  <p className="mb-4 text-4xl">🗓️</p>
                  <p className="text-[15px] font-medium text-surface-500">No upcoming interviews</p>
                </div>
              ) : (
                <div className="divide-y divide-surface-100">
                  {upcomingInterviews.slice(0, 4).map((interview) => (
                    <div key={interview._id} className="px-6 py-5 hover:bg-surface-50/50 transition-colors">
                      <p className="text-[15px] font-bold text-surface-800">{interview.employer?.name}</p>
                      <p className="mt-1 text-[13px] font-medium text-brand-600">{interview.job?.title}</p>
                      <div className="mt-3 space-y-1.5 text-[13px] font-medium text-surface-500">
                        <p className="flex items-center gap-2"><span className="text-base text-surface-400">🕒</span> {new Date(interview.scheduledAt).toLocaleString()}</p>
                        <p className="flex items-center gap-2">
                           <span className="text-base text-surface-400">{interview.interviewType === "online" ? "💻" : "📍"}</span>
                           <span className="truncate">{interview.interviewType === "online" ? interview.meetingLink : interview.location}</span>
                        </p>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="badge badge-neutral bg-surface-100 text-surface-600 border-surface-200">
                          {interview.responseStatus}
                        </span>
                        {interview.responseStatus !== "accepted" && (
                          <button type="button" onClick={() => handleInterviewResponse(interview._id, "accepted")} className="badge badge-success cursor-pointer hover:bg-green-100 transition-colors">
                            Accept
                          </button>
                        )}
                        {interview.responseStatus !== "declined" && (
                          <button type="button" onClick={() => handleInterviewResponse(interview._id, "declined")} className="badge badge-error cursor-pointer hover:bg-red-100 transition-colors">
                            Decline
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="premium-card bg-white shadow-sm flex flex-col h-full border-surface-200">
            <div className="flex items-center justify-between border-b border-surface-100 bg-surface-50/50 px-6 py-5">
              <h2 className="text-lg font-bold text-surface-900 font-['Outfit']">Past Interviews</h2>
              <span className="badge badge-neutral bg-surface-100 text-surface-600 border-surface-200">{pastInterviews.length} total</span>
            </div>
            <div className="flex-1 overflow-auto">
              {pastInterviews.length === 0 ? (
                <div className="px-6 py-12 text-center h-full flex flex-col justify-center">
                  <p className="mb-4 text-4xl">🕘</p>
                  <p className="text-[15px] font-medium text-surface-500">No past interviews yet</p>
                </div>
              ) : (
                <div className="divide-y divide-surface-100">
                  {pastInterviews.slice(0, 4).map((interview) => (
                    <div key={interview._id} className="px-6 py-5 hover:bg-surface-50/50 transition-colors">
                      <p className="text-[15px] font-bold text-surface-800">{interview.employer?.name}</p>
                      <p className="mt-1 text-[13px] font-medium text-surface-600">{interview.job?.title}</p>
                      <p className="mt-2 text-[13px] font-medium text-surface-500 flex items-center gap-2"><span className="text-base text-surface-400">🕒</span> {new Date(interview.scheduledAt).toLocaleString()}</p>
                      <span className="mt-3 inline-block badge badge-neutral bg-surface-100 text-surface-600 border-surface-200 capitalize">{interview.responseStatus}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="premium-card bg-white shadow-sm border-surface-200">
          <div className="flex items-center justify-between border-b border-surface-100 bg-surface-50/50 px-8 py-5">
            <h2 className="text-lg font-bold text-surface-900 font-['Outfit']">Latest Jobs</h2>
            <button onClick={() => navigate("/jobs")} className="text-[13px] font-bold text-brand-600 hover:text-brand-700 transition-colors">View all</button>
          </div>
          <div className="divide-y divide-surface-100">
            {recentJobs.map((job) => (
              <div key={job._id} onClick={() => navigate(`/jobs/${job._id}`)} className="flex cursor-pointer flex-col sm:flex-row sm:items-center justify-between gap-4 px-8 py-5 transition-colors hover:bg-brand-50/50 group">
                <div className="min-w-0">
                  <p className="text-[15px] font-bold text-surface-800 group-hover:text-brand-600 transition-colors truncate">{job.title}</p>
                  <p className="mt-1.5 text-[13px] font-medium text-surface-500 truncate">{job.employer?.name} · {job.location}</p>
                </div>
                <span className={`badge shrink-0 self-start sm:self-auto ${jobTypeColors[job.jobType] || 'badge-neutral'}`}>{job.jobType}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="premium-card bg-white shadow-sm border-surface-200 flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-surface-100 bg-surface-50/50 px-6 py-5">
              <h2 className="text-lg font-bold text-surface-900 font-['Outfit']">Saved Jobs</h2>
              <button onClick={() => navigate("/saved-jobs")} className="text-[13px] font-bold text-brand-600 hover:text-brand-700 transition-colors">View all</button>
            </div>
            <div className="flex-1 overflow-auto">
              {savedJobs.length === 0 ? (
                <div className="px-6 py-10 text-center text-[15px] font-medium text-surface-500 h-full flex items-center justify-center">No saved jobs yet.</div>
              ) : (
                <div className="divide-y divide-surface-100">
                  {savedJobs.slice(0, 4).map((entry) => (
                    <button
                      key={entry._id}
                      type="button"
                      onClick={() => navigate(`/jobs/${entry.job?._id}`)}
                      className="flex w-full flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-5 text-left transition-colors hover:bg-brand-50/50 group"
                    >
                      <div className="min-w-0 pr-4">
                        <p className="text-[15px] font-bold text-surface-800 group-hover:text-brand-600 transition-colors truncate">{entry.job?.title}</p>
                        <p className="mt-1 text-[13px] font-medium text-surface-500 truncate">{entry.job?.organization?.name} · {entry.job?.location}</p>
                      </div>
                      <span className={`badge shrink-0 self-start sm:self-auto ${jobTypeColors[entry.job?.jobType] || 'badge-neutral'}`}>{entry.job?.jobType}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="premium-card bg-white shadow-sm border-surface-200 flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-surface-100 bg-surface-50/50 px-6 py-5">
              <h2 className="text-lg font-bold text-surface-900 font-['Outfit']">Job Alerts</h2>
              <span className="badge badge-brand">{jobAlerts.length} matches</span>
            </div>
            <div className="flex-1 overflow-auto">
              {jobAlerts.length === 0 ? (
                <div className="px-6 py-10 text-center text-[15px] font-medium text-surface-500 h-full flex flex-col justify-center items-center">
                   <p className="mb-2 text-2xl">🔔</p>
                   Save jobs to start receiving matching alerts.
                </div>
              ) : (
                <div className="divide-y divide-surface-100">
                  {jobAlerts.slice(0, 4).map((job) => (
                    <button
                      key={job._id}
                      type="button"
                      onClick={() => navigate(`/jobs/${job._id}`)}
                      className="flex w-full flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-5 text-left transition-colors hover:bg-brand-50/50 group"
                    >
                      <div className="min-w-0 pr-4">
                        <p className="text-[15px] font-bold text-surface-800 group-hover:text-brand-600 transition-colors truncate">{job.title}</p>
                        <p className="mt-1 text-[13px] font-medium text-surface-500 truncate">{job.organization?.name} · {job.location}</p>
                      </div>
                      <span className={`badge shrink-0 self-start sm:self-auto ${jobTypeColors[job.jobType] || 'badge-neutral'}`}>{job.jobType}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobSeekerDashboard;
