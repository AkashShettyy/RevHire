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
    <div className="app-shell">
      <div className="absolute top-0 right-0 -mr-40 h-[600px] w-[600px] rounded-full bg-brand-300/20 blur-[100px] pointer-events-none"></div>

      <div className="pt-10 pb-10 border-b border-surface-200/60 bg-white/50 backdrop-blur-md relative z-10">
        <div className="layout-container max-w-5xl">
          <div className="page-hero grid gap-6 lg:grid-cols-[1.15fr,0.85fr] lg:items-end">
            <div>
              <span className="eyebrow mb-4">
                Application History
              </span>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-surface-900 sm:text-4xl">My Applications</h1>
              <p className="mt-3 max-w-2xl text-[17px] font-medium text-surface-700">
                Review recent submissions, check where each application sits, and withdraw pending ones when priorities shift.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="metric-tile text-center sm:text-left">
                <p className="text-[11px] font-bold uppercase tracking-widest text-surface-600">Total</p>
                <p className="mt-1.5 font-display text-2xl font-extrabold text-surface-900">{applications.length}</p>
              </div>
              <div className="metric-tile text-center sm:text-left">
                <p className="text-[11px] font-bold uppercase tracking-widest text-surface-600">Pending</p>
                <p className="mt-1.5 font-display text-2xl font-extrabold text-surface-900">{applications.filter((app) => app.status === "applied").length}</p>
              </div>
              <div className="metric-tile text-center sm:text-left">
                <p className="text-[11px] font-bold uppercase tracking-widest text-surface-600">Shown</p>
                <p className="mt-1.5 font-display text-2xl font-extrabold text-surface-900">{filteredApplications.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="layout-container max-w-5xl py-10 relative z-10">
        {message && (
          <div className="rounded-xl border border-success-200 bg-success-50 p-4 font-semibold text-success-800 shadow-sm mb-6 animate-fade-in">
            {message}
          </div>
        )}

        {applications.length === 0 ? (
            <div className="premium-card border-none bg-white p-16 text-center shadow-sm">
            <div className="inline-flex w-24 h-24 rounded-full bg-surface-50 items-center justify-center mb-6">
              <span className="text-4xl">📭</span>
            </div>
            <h3 className="text-2xl font-bold text-surface-900 font-display mb-2">No applications yet</h3>
            <p className="mb-8 mt-1 text-[15px] font-medium text-surface-700">Start applying to jobs to track them here</p>
            <button onClick={() => navigate("/jobs")} className="btn-primary">Browse Jobs</button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2.5">
              {applicationFilters.map((filter) => {
                const isActive = filter.value === activeFilter;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setActiveFilter(filter.value)}
                    className={`rounded-full border px-5 py-2 text-sm font-bold transition-all ${
                      isActive
                        ? "border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-500/20 hover:bg-brand-700"
                        : "border-surface-300 bg-white text-surface-700 hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 hover:shadow-sm"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            {filteredApplications.length === 0 ? (
              <div className="premium-card p-12 text-center bg-white border-surface-200">
                <p className="text-[15px] font-medium text-surface-700">No {applicationFilters.find((filter) => filter.value === activeFilter)?.label.toLowerCase()} applications found.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredApplications.map((app) => (
                  <div key={app._id} className="premium-card p-6 bg-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-brand-200 group relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-400 to-indigo-500 opacity-0 transition-opacity group-hover:opacity-100"></div>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ml-2">
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-display cursor-pointer truncate text-lg font-bold text-surface-900 transition-colors hover:text-brand-700"
                          onClick={() => navigate(`/jobs/${app.job?._id}`)}
                        >
                          {app.job?.title}
                        </h3>
                        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[14px] font-medium text-surface-700">
                          <span className="flex items-center gap-1.5"><span className="text-surface-400">📍</span> {app.job?.location}</span>
                          <span className="flex items-center gap-1.5"><span className="text-surface-400">📅</span> Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                          {app.job?.jobType && (
                            <span className={`badge ml-1 ${jobTypeColors[app.job.jobType] || 'badge-neutral'}`}>
                              {app.job.jobType}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`badge shrink-0 sm:self-center py-1.5 ${statusColors[app.status]}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>

                    {app.status === "applied" && (
                      <div className="mt-5 border-t border-surface-100 pt-4 ml-2 flex justify-end">
                        <button
                          onClick={() => handleWithdraw(app._id)}
                          className="text-sm font-bold text-error-600 transition-colors hover:text-error-700 bg-error-50 px-4 py-2 rounded-xl hover:bg-error-100"
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
        )}
      </div>
    </div>
  );
}

export default ApplicationHistory;
