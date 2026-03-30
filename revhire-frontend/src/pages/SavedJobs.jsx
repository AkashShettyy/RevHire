import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSavedJobs, removeSavedJob } from "../services/savedJobService";

const jobTypeColors = {
  fulltime: "bg-emerald-50 text-emerald-700",
  parttime: "bg-sky-50 text-sky-700",
  internship: "bg-purple-50 text-purple-700",
  remote: "bg-sky-50 text-sky-700",
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
      <div className="app-page flex items-center justify-center">
        <div className="flex items-center gap-3 text-stone-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="app-hero">
        <div className="app-shell max-w-5xl py-8">
          <div className="app-spotlight px-6 py-7 sm:px-8">
            <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr] lg:items-end">
              <div>
                <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                  Saved roles
                </span>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Saved Jobs</h1>
                <p className="mt-3 text-sm leading-6 text-white/76">
                  Keep shortlisted openings in one place and revisit them before applying.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[26px] border border-white/16 bg-white/10 px-4 py-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Saved</p>
                  <p className="mt-3 text-3xl font-bold text-white">{savedJobs.length}</p>
                </div>
                <div className="rounded-[26px] border border-white/16 bg-white/10 px-4 py-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Status</p>
                  <p className="mt-3 text-lg font-bold text-white">{savedJobs.length > 0 ? "Tracked" : "Empty"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="app-shell max-w-5xl py-8">
        {message && <div className="app-message-success mb-5">{message}</div>}

        {savedJobs.length === 0 ? (
          <div className="app-empty">
            <p className="mb-4 text-5xl">🔖</p>
            <p className="font-medium text-stone-700">No saved jobs yet</p>
            <p className="mt-1 text-sm text-stone-400">Save interesting roles from search or job details.</p>
            <button onClick={() => navigate("/jobs")} className="app-button mt-6">
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedJobs.map((entry) => (
              <article key={entry._id} className="app-panel p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={() => navigate(`/jobs/${entry.job?._id}`)}
                        className="text-left text-lg font-semibold text-stone-900 transition-colors hover:text-blue-700"
                      >
                        {entry.job?.title}
                      </button>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${jobTypeColors[entry.job?.jobType] || "bg-stone-100 text-stone-600"}`}>
                        {entry.job?.jobType}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-stone-600">{entry.job?.organization?.name}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-stone-500">
                      <span>📍 {entry.job?.location}</span>
                      {entry.job?.salaryRange?.min && (
                        <span>💰 ₹{entry.job.salaryRange.min.toLocaleString()} - ₹{entry.job.salaryRange.max?.toLocaleString()}</span>
                      )}
                      <span>📅 Deadline {new Date(entry.job?.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => navigate(`/jobs/${entry.job?._id}`)} className="app-button px-4 py-2">
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(entry.job?._id)}
                      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
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
