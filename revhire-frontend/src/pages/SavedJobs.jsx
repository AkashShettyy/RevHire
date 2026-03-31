import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSavedJobs, removeSavedJob } from "../services/savedJobService";

const jobTypeColors = {
  fulltime: "badge-success",
  parttime: "badge-brand",
  internship: "badge-warning",
  remote: "badge-brand",
};

function SavedJobs() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchSavedJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getSavedJobs(token);
      setSavedJobs(data.savedJobs);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  async function handleRemove(jobId) {
    try {
      await removeSavedJob(jobId, token);
      setSavedJobs((current) => current.filter((entry) => entry.job?._id !== jobId));
      setMessage("Saved job removed");
      setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to update saved jobs.");
    }
  }

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
      <div className="absolute top-0 right-0 -mr-40 h-[600px] w-[600px] rounded-full bg-amber-300/20 blur-[100px] pointer-events-none"></div>

      <div className="pt-10 pb-10 border-b border-surface-200/60 bg-white/50 backdrop-blur-md relative z-10">
        <div className="layout-container max-w-5xl">
          <div className="page-hero grid gap-6 lg:grid-cols-[1.2fr,0.8fr] lg:items-end">
            <div>
              <span className="eyebrow mb-4">
                Saved Roles
              </span>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-surface-900 sm:text-4xl">Saved Jobs</h1>
              <p className="mt-3 max-w-2xl text-[17px] font-medium text-surface-700">
                Keep shortlisted openings in one place and revisit them before applying.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="metric-tile text-center sm:text-left">
                <p className="text-[11px] font-bold uppercase tracking-widest text-surface-600">Saved</p>
                <p className="mt-1.5 font-display text-2xl font-extrabold text-surface-900">{savedJobs.length}</p>
              </div>
              <div className="metric-tile text-center sm:text-left">
                <p className="text-[11px] font-bold uppercase tracking-widest text-surface-600">Status</p>
                <p className="mt-1.5 font-display text-2xl font-extrabold text-surface-900">{savedJobs.length > 0 ? "Tracked" : "Empty"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="layout-container max-w-5xl py-10 relative z-10">
        {message && <div className="rounded-xl border border-success-200 bg-success-50 p-4 font-semibold text-success-800 shadow-sm mb-6 animate-fade-in">{message}</div>}

        {savedJobs.length === 0 ? (
          <div className="premium-card p-16 text-center bg-white border-none shadow-sm">
            <div className="inline-flex w-24 h-24 rounded-full bg-surface-50 items-center justify-center mb-6">
              <span className="text-4xl">🔖</span>
            </div>
            <h3 className="text-2xl font-bold text-surface-900 font-['Outfit'] mb-2">No saved jobs yet</h3>
            <p className="mb-8 mt-1 text-[15px] font-medium text-surface-700">Save interesting roles from search or job details.</p>
            <button onClick={() => navigate("/jobs")} className="btn-primary">
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedJobs.map((entry) => (
              <article key={entry._id} className="premium-card p-6 bg-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-brand-200 group relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-400 to-indigo-500 opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between ml-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={() => navigate(`/jobs/${entry.job?._id}`)}
                        className="font-display text-left text-lg font-bold text-surface-900 transition-colors hover:text-brand-700"
                      >
                        {entry.job?.title}
                      </button>
                      <span className={`badge shrink-0 ${jobTypeColors[entry.job?.jobType] || "badge-neutral"}`}>
                        {entry.job?.jobType}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm font-medium text-surface-700">{entry.job?.organization?.name}</p>
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[14px] font-medium text-surface-700">
                      <span className="flex items-center gap-1.5"><span className="text-surface-400">📍</span> {entry.job?.location}</span>
                      {entry.job?.salaryRange?.min && (
                        <span className="flex items-center gap-1.5"><span className="text-surface-400">💰</span> ₹{entry.job.salaryRange.min.toLocaleString()} - ₹{entry.job.salaryRange.max?.toLocaleString()}</span>
                      )}
                      <span className="flex items-center gap-1.5"><span className="text-surface-400">📅</span> Deadline {new Date(entry.job?.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => navigate(`/jobs/${entry.job?._id}`)} className="btn-secondary px-4 py-2 text-sm">
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(entry.job?._id)}
                      className="px-4 py-2 rounded-xl text-[13px] font-bold text-error-600 border border-error-200 bg-error-50 hover:bg-error-100 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SavedJobs;
