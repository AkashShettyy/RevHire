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
    { label: "Total Applied", value: applications.length, accent: "from-brand-400 to-brand-600" },
    { label: "Shortlisted", value: applications.filter((a) => a.status === "shortlisted").length, accent: "from-emerald-400 to-emerald-600" },
    { label: "Pending", value: applications.filter((a) => a.status === "applied").length, accent: "from-amber-400 to-amber-600" },
    { label: "Interviews", value: interviews.length, accent: "from-cyan-400 to-cyan-600" },
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
        <div className="flex items-center gap-3 text-surface-500 font-medium font-display">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          Loading...
        </div>
      </div>
    );

  return (
    <div className="app-shell">
      <div className="pt-8 pb-6 border-b border-surface-200/60 bg-white">
        <div className="layout-container mx-auto max-w-6xl">
          <div className="section-card border-brand-100 bg-gradient-to-br from-white via-brand-50/40 to-cyan-50/30 px-6 py-6 sm:px-8">
            <div className="grid gap-6 md:grid-cols-[1.2fr,0.8fr] md:items-end">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-surface-900 sm:text-3xl">Job Seeker Dashboard</h1>
                <p className="mt-2 text-sm text-surface-700">Track applications, interviews, and saved activity.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button onClick={() => navigate("/jobs")} className="btn-primary">Find Jobs</button>
                  <button onClick={() => navigate("/applications")} className="btn-secondary">My Applications</button>
                  <button onClick={() => navigate("/resume")} className="btn-secondary">Resume</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-surface-200 bg-white/95 px-4 py-3 shadow-sm ring-1 ring-white/70">
                  <p className="text-xs font-medium text-surface-500">Upcoming Interviews</p>
                  <p className="mt-1 text-2xl font-semibold text-surface-900">{upcomingInterviews.length}</p>
                </div>
                <div className="rounded-xl border border-surface-200 bg-white/95 px-4 py-3 shadow-sm ring-1 ring-white/70">
                  <p className="text-xs font-medium text-surface-500">Saved Jobs</p>
                  <p className="mt-1 text-2xl font-semibold text-surface-900">{savedJobs.length}</p>
                </div>
              </div>
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

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-display font-bold text-surface-900">Overview</h2>
            <span className="text-sm text-surface-500">Live summary</span>
          </div>
          <div className="stat-grid">
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

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="premium-card bg-white shadow-sm flex flex-col h-full border-surface-200">
            <div className="flex border-b border-surface-100 bg-surface-50/50 px-6 py-5 items-center justify-between">
              <h2 className="text-lg font-bold text-surface-900 font-display">Recent Applications</h2>
              <button onClick={() => navigate("/applications")} className="text-[13px] font-bold text-brand-600 hover:text-brand-700 transition-colors">View all</button>
            </div>
            <div className="flex-1 overflow-auto">
              {applications.length === 0 ? (
                <div className="px-6 py-12 text-center h-full flex flex-col justify-center">
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
              <h2 className="text-lg font-bold text-surface-900 font-display">Upcoming Interviews</h2>
              <span className="badge badge-brand">{upcomingInterviews.length} total</span>
            </div>
            <div className="flex-1 overflow-auto">
              {upcomingInterviews.length === 0 ? (
                <div className="px-6 py-12 text-center h-full flex flex-col justify-center">
                  <p className="text-[15px] font-medium text-surface-500">No upcoming interviews</p>
                </div>
              ) : (
                <div className="divide-y divide-surface-100">
                  {upcomingInterviews.slice(0, 4).map((interview) => (
                    <div key={interview._id} className="px-6 py-5 hover:bg-surface-50/50 transition-colors">
                      <p className="text-[15px] font-bold text-surface-800">{interview.employer?.name}</p>
                      <p className="mt-1 text-[13px] font-medium text-surface-600">{interview.job?.title}</p>
                      <div className="mt-3 space-y-1.5 text-[13px] font-medium text-surface-500">
                        <p><span className="font-semibold text-surface-700">Scheduled:</span> {new Date(interview.scheduledAt).toLocaleString()}</p>
                        <p className="truncate"><span className="font-semibold text-surface-700">Format:</span> {interview.interviewType === "online" ? interview.meetingLink : interview.location}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="badge badge-neutral bg-surface-100 text-surface-600 border-surface-200">
                          {interview.responseStatus}
                        </span>
                        {interview.responseStatus !== "accepted" && (
                          <button type="button" onClick={() => handleInterviewResponse(interview._id, "accepted")} className="rounded-md border border-success-200 bg-success-50 px-2.5 py-1 text-xs font-medium text-success-700 transition-colors hover:bg-success-100">
                            Accept
                          </button>
                        )}
                        {interview.responseStatus !== "declined" && (
                          <button type="button" onClick={() => handleInterviewResponse(interview._id, "declined")} className="rounded-md border border-error-200 bg-error-50 px-2.5 py-1 text-xs font-medium text-error-700 transition-colors hover:bg-error-100">
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
              <h2 className="text-lg font-bold text-surface-900 font-display">Past Interviews</h2>
              <span className="badge badge-neutral bg-surface-100 text-surface-600 border-surface-200">{pastInterviews.length} total</span>
            </div>
            <div className="flex-1 overflow-auto">
              {pastInterviews.length === 0 ? (
                <div className="px-6 py-12 text-center h-full flex flex-col justify-center">
                  <p className="text-[15px] font-medium text-surface-500">No past interviews yet</p>
                </div>
              ) : (
                <div className="divide-y divide-surface-100">
                  {pastInterviews.slice(0, 4).map((interview) => (
                    <div key={interview._id} className="px-6 py-5 hover:bg-surface-50/50 transition-colors">
                      <p className="text-[15px] font-bold text-surface-800">{interview.employer?.name}</p>
                      <p className="mt-1 text-[13px] font-medium text-surface-600">{interview.job?.title}</p>
                      <p className="mt-2 text-[13px] font-medium text-surface-500"><span className="font-semibold text-surface-700">Scheduled:</span> {new Date(interview.scheduledAt).toLocaleString()}</p>
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
            <h2 className="text-lg font-bold text-surface-900 font-display">Latest Jobs</h2>
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
              <h2 className="text-lg font-bold text-surface-900 font-display">Saved Jobs</h2>
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
              <h2 className="text-lg font-bold text-surface-900 font-display">Job Alerts</h2>
              <span className="badge badge-brand">{jobAlerts.length} matches</span>
            </div>
            <div className="flex-1 overflow-auto">
              {jobAlerts.length === 0 ? (
                <div className="px-6 py-10 text-center text-[15px] font-medium text-surface-500 h-full flex flex-col justify-center items-center">
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
