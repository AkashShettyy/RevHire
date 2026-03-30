import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserApplications, withdrawApplication } from "../services/applicationService";
import { useNavigate } from "react-router-dom";

const applicationFilters = [
  { label: "All", value: "all" },
  { label: "Pending", value: "applied" },
  { label: "Shortlisted", value: "shortlisted" },
  { label: "Rejected", value: "rejected" },
  { label: "Withdrawn", value: "withdrawn" },
];

const statusColors = {
  applied: "bg-blue-50 text-blue-700 border border-blue-100",
  shortlisted: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  rejected: "bg-red-50 text-red-600 border border-red-100",
  withdrawn: "bg-slate-100 text-slate-500 border border-slate-200",
};

const jobTypeColors = {
  fulltime: "bg-emerald-50 text-emerald-700",
  parttime: "bg-sky-50 text-sky-700",
  internship: "bg-purple-50 text-purple-700",
  remote: "bg-sky-50 text-sky-700",
};

function ApplicationHistory() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const filteredApplications = activeFilter === "all"
    ? applications
    : applications.filter((app) => app.status === activeFilter);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getUserApplications(token);
      setApplications(data.applications);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  async function handleWithdraw(id) {
    try {
      await withdrawApplication(id, token);
      setMessage("Application withdrawn");
      setTimeout(() => setMessage(""), 3000);
      fetchApplications();
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  }

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
        <div className="app-shell max-w-4xl py-8">
          <div className="app-spotlight px-6 py-7 sm:px-8">
            <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr] lg:items-end">
              <div>
                <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                  Application history
                </span>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">My Applications</h1>
                <p className="mt-3 text-sm leading-6 text-white/76">
                  Review recent submissions, check where each application sits, and withdraw pending ones when priorities shift.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[26px] border border-white/16 bg-white/10 px-4 py-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Total</p>
                  <p className="mt-3 text-3xl font-bold text-white">{applications.length}</p>
                </div>
                <div className="rounded-[26px] border border-white/16 bg-white/10 px-4 py-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Pending</p>
                  <p className="mt-3 text-3xl font-bold text-white">{applications.filter((app) => app.status === "applied").length}</p>
                </div>
                <div className="rounded-[26px] border border-white/16 bg-white/10 px-4 py-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Shown</p>
                  <p className="mt-3 text-3xl font-bold text-white">{filteredApplications.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="app-shell max-w-4xl py-8">
        {message && (
          <div className="app-message-success mb-5">{message}</div>
        )}

        {applications.length === 0 ? (
          <div className="app-empty">
            <p className="text-4xl mb-4">📭</p>
            <p className="font-medium text-stone-700">No applications yet</p>
            <p className="mb-6 mt-1 text-sm text-stone-400">Start applying to jobs to track them here</p>
            <button onClick={() => navigate("/jobs")} className="app-button">Browse Jobs</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {applicationFilters.map((filter) => {
                const isActive = filter.value === activeFilter;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setActiveFilter(filter.value)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100"
                        : "border-stone-200 bg-white text-stone-600 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            {filteredApplications.length === 0 ? (
              <div className="app-panel p-8 text-center text-sm text-stone-500">
                No {applicationFilters.find((filter) => filter.value === activeFilter)?.label.toLowerCase()} applications found.
              </div>
            ) : filteredApplications.map((app) => (
              <div key={app._id} className="app-panel p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <h3
                      className="cursor-pointer font-semibold text-stone-900 transition-colors hover:text-blue-700"
                      onClick={() => navigate(`/jobs/${app.job?._id}`)}
                    >
                      {app.job?.title}
                    </h3>
                    <div className="mt-3 grid gap-2 text-sm text-stone-500 sm:grid-cols-3">
                      <span>📍 {app.job?.location}</span>
                      <span>📅 Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                      {app.job?.jobType && (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${jobTypeColors[app.job.jobType]}`}>
                          {app.job.jobType}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${statusColors[app.status]}`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>

                {app.status === "applied" && (
                  <div className="mt-4 border-t border-stone-100 pt-4">
                    <button
                      onClick={() => handleWithdraw(app._id)}
                      className="text-sm font-medium text-red-500 transition-colors hover:text-red-600"
                    >
                      Withdraw Application
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicationHistory;
