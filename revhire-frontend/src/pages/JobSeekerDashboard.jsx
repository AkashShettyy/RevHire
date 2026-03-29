import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserApplications } from "../services/applicationService";
import { getMyInterviews, respondToInterview } from "../services/interviewService";
import { getAllJobs } from "../services/jobService";
import { getJobAlerts, getSavedJobs } from "../services/savedJobService";
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
    { label: "Total Applied", value: applications.length, color: "text-blue-700", bg: "bg-blue-100", icon: "📨" },
    { label: "Shortlisted", value: applications.filter((a) => a.status === "shortlisted").length, color: "text-emerald-600", bg: "bg-emerald-100", icon: "✅" },
    { label: "Pending", value: applications.filter((a) => a.status === "applied").length, color: "text-sky-700", bg: "bg-sky-100", icon: "⏳" },
    { label: "Interviews", value: interviews.length, color: "text-violet-700", bg: "bg-violet-100", icon: "🗓️" },
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
            <p className="mt-2 text-sm text-stone-500">Track applications, upcoming interviews, and recent activity from one place.</p>
          </div>
        </div>
      </div>

      <div className="app-shell space-y-8 py-8">
        {message && (
          <div className="app-message-success">{message.charAt(0).toUpperCase() + message.slice(1)}</div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { label: "My Resume", desc: "Refresh your profile", icon: "Resume", path: "/resume", color: "from-sky-500 to-blue-600" },
            { label: "Saved Jobs", desc: "Track interesting roles", icon: "Saved", path: "/saved-jobs", color: "from-amber-500 to-orange-600" },
            { label: "Applications", desc: "Review recent submissions", icon: "Track", path: "/applications", color: "from-indigo-500 to-blue-700" },
            { label: "Interview Calendar", desc: "Manage upcoming conversations", icon: "Calendar", path: "/interviews", color: "from-violet-500 to-indigo-700" },
            { label: "Settings", desc: "Update sign-in details", icon: "Account", path: "/settings", color: "from-slate-600 to-slate-800" },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.path)}
              className={`rounded-[28px] bg-gradient-to-br ${a.color} p-5 text-left text-white shadow-xl shadow-stone-900/10 transition-all duration-200 hover:-translate-y-1`}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">{a.icon}</span>
              <p className="mt-3 font-semibold">{a.label}</p>
              <p className="mt-0.5 text-sm text-white/70">{a.desc}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="app-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
              <h2 className="font-semibold text-stone-900">Recent Applications</h2>
              <button onClick={() => navigate("/applications")} className="text-sm font-medium text-blue-600 hover:underline">View all</button>
            </div>
            {applications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="mb-3 text-3xl">📭</p>
                <p className="text-sm text-stone-500">No applications yet</p>
                <button onClick={() => navigate("/jobs")} className="app-button mt-4 px-4 py-2">Browse Jobs</button>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {applications.slice(0, 4).map((app) => (
                  <div key={app._id} className="flex items-center justify-between px-6 py-4">
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
              <h2 className="font-semibold text-stone-900">Upcoming Interviews</h2>
              <span className="text-sm text-stone-400">{upcomingInterviews.length} total</span>
            </div>
            {upcomingInterviews.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="mb-3 text-3xl">🗓️</p>
                <p className="text-sm text-stone-500">No upcoming interviews</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {upcomingInterviews.slice(0, 4).map((interview) => (
                  <div key={interview._id} className="px-6 py-4">
                    <p className="text-sm font-medium text-stone-900">{interview.employer?.name}</p>
                    <p className="mt-1 text-xs text-stone-400">{interview.job?.title}</p>
                    <p className="mt-1 text-xs text-stone-500">{new Date(interview.scheduledAt).toLocaleString()}</p>
                    <p className="mt-1 text-xs text-stone-500">{interview.interviewType === "online" ? "Online" : "In person"}</p>
                    <p className="mt-1 text-xs text-stone-400">{interview.interviewType === "online" ? interview.meetingLink : interview.location}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-stone-600">
                        {interview.responseStatus}
                      </span>
                      {interview.responseStatus !== "accepted" && (
                        <button type="button" onClick={() => handleInterviewResponse(interview._id, "accepted")} className="text-sm font-semibold text-emerald-700 transition-colors hover:underline">
                          Accept
                        </button>
                      )}
                      {interview.responseStatus !== "declined" && (
                        <button type="button" onClick={() => handleInterviewResponse(interview._id, "declined")} className="text-sm font-semibold text-red-500 transition-colors hover:underline">
                          Decline
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="app-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
              <h2 className="font-semibold text-stone-900">Past Interviews</h2>
              <span className="text-sm text-stone-400">{pastInterviews.length} total</span>
            </div>
            {pastInterviews.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="mb-3 text-3xl">🕘</p>
                <p className="text-sm text-stone-500">No past interviews yet</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {pastInterviews.slice(0, 4).map((interview) => (
                  <div key={interview._id} className="px-6 py-4">
                    <p className="text-sm font-medium text-stone-900">{interview.employer?.name}</p>
                    <p className="mt-1 text-xs text-stone-400">{interview.job?.title}</p>
                    <p className="mt-1 text-xs text-stone-500">{new Date(interview.scheduledAt).toLocaleString()}</p>
                    <p className="mt-1 text-xs text-stone-400">{interview.responseStatus}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="app-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
            <h2 className="font-semibold text-stone-900">Latest Jobs</h2>
            <button onClick={() => navigate("/jobs")} className="text-sm font-medium text-blue-600 hover:underline">View all</button>
          </div>
          <div className="divide-y divide-stone-100">
            {recentJobs.map((job) => (
              <div key={job._id} onClick={() => navigate(`/jobs/${job._id}`)} className="flex cursor-pointer items-center justify-between px-6 py-4 transition-colors hover:bg-blue-50/60">
                <div>
                  <p className="text-sm font-medium text-stone-900">{job.title}</p>
                  <p className="mt-0.5 text-xs text-stone-400">{job.employer?.name} · {job.location}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${jobTypeColors[job.jobType]}`}>{job.jobType}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="app-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
              <h2 className="font-semibold text-stone-900">Saved Jobs</h2>
              <button onClick={() => navigate("/saved-jobs")} className="text-sm font-medium text-blue-600 hover:underline">View all</button>
            </div>
            {savedJobs.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-stone-500">No saved jobs yet.</div>
            ) : (
              <div className="divide-y divide-stone-100">
                {savedJobs.slice(0, 4).map((entry) => (
                  <button
                    key={entry._id}
                    type="button"
                    onClick={() => navigate(`/jobs/${entry.job?._id}`)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-blue-50/60"
                  >
                    <div>
                      <p className="text-sm font-medium text-stone-900">{entry.job?.title}</p>
                      <p className="mt-0.5 text-xs text-stone-400">{entry.job?.organization?.name} · {entry.job?.location}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${jobTypeColors[entry.job?.jobType]}`}>{entry.job?.jobType}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="app-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
              <h2 className="font-semibold text-stone-900">Job Alerts</h2>
              <span className="text-sm text-stone-400">{jobAlerts.length} matches</span>
            </div>
            {jobAlerts.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-stone-500">Save jobs to start receiving matching alerts.</div>
            ) : (
              <div className="divide-y divide-stone-100">
                {jobAlerts.slice(0, 4).map((job) => (
                  <button
                    key={job._id}
                    type="button"
                    onClick={() => navigate(`/jobs/${job._id}`)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-blue-50/60"
                  >
                    <div>
                      <p className="text-sm font-medium text-stone-900">{job.title}</p>
                      <p className="mt-0.5 text-xs text-stone-400">{job.organization?.name} · {job.location}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${jobTypeColors[job.jobType]}`}>{job.jobType}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobSeekerDashboard;
