import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAllJobs } from "../services/jobService";
import { useAuth } from "../context/AuthContext";
import { getSavedJobs, removeSavedJob, saveJob } from "../services/savedJobService";

const jobTypeColors = {
  fulltime: "bg-emerald-50 text-emerald-700",
  parttime: "bg-sky-50 text-sky-700",
  internship: "bg-purple-50 text-purple-700",
  remote: "bg-sky-50 text-sky-700",
};

function JobSearch() {
  const { token, user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    jobType: "",
    company: "",
    skills: "",
    salaryMin: "",
    salaryMax: "",
    sortBy: "newest",
    daysPosted: "",
    page: 1,
    limit: 9,
  });
  const navigate = useNavigate();
  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => !["page", "limit", "sortBy"].includes(key) && value !== "",
  ).length;

  const fetchJobs = useCallback(async (activeFilters) => {
    setIsLoading(true);
    try {
      const data = await getAllJobs(activeFilters);
      setJobs(data.jobs);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: data.jobs.length });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSavedJobs = useCallback(async () => {
    try {
      const data = await getSavedJobs(token);
      setSavedJobIds(data.savedJobs.map((entry) => entry.job?._id).filter(Boolean));
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  useEffect(() => {
    fetchJobs(filters);
  }, [fetchJobs, filters]);

  useEffect(() => {
    if (user?.role === "jobseeker" && token) {
      fetchSavedJobs();
    }
  }, [fetchSavedJobs, token, user]);

  function handleFilterChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  function handleSearch(e) {
    e.preventDefault();
    setFilters((current) => ({ ...current, page: 1 }));
  }

  async function handleToggleSave(event, jobId) {
    event.stopPropagation();
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      if (savedJobIds.includes(jobId)) {
        await removeSavedJob(jobId, token);
        setSavedJobIds((current) => current.filter((id) => id !== jobId));
      } else {
        await saveJob(jobId, token);
        setSavedJobIds((current) => [...current, jobId]);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function handlePageChange(nextPage) {
    setFilters((current) => ({ ...current, page: nextPage }));
  }

  return (
    <div className="app-page">
      <div className="app-hero">
        <div className="app-shell py-10">
          <div className="mx-auto max-w-5xl">
            <div className="app-spotlight px-6 py-7 sm:px-8">
              <div className="grid gap-8 xl:grid-cols-[1.2fr,0.8fr] xl:items-end">
                <div>
                  <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                    Job discovery
                  </span>
                  <h1 className="mt-5 text-4xl font-bold tracking-tight text-white">Find roles that fit your search.</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/76">
                    Browse posted openings and narrow them by title, location, skills, compensation, or recency.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[26px] border border-white/16 bg-white/10 px-4 py-4 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Results</p>
                    <p className="mt-3 text-3xl font-bold text-white">{pagination.total}</p>
                  </div>
                  <div className="rounded-[26px] border border-white/16 bg-white/10 px-4 py-4 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Filters</p>
                    <p className="mt-3 text-3xl font-bold text-white">{activeFilterCount}</p>
                  </div>
                  <div className="rounded-[26px] border border-white/16 bg-white/10 px-4 py-4 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Sort</p>
                    <p className="mt-3 text-lg font-bold capitalize text-white">{filters.sortBy.replace("_", " ")}</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSearch} className="app-panel mt-6 grid grid-cols-1 items-center gap-3 p-4 md:grid-cols-3 xl:grid-cols-4">
            <input
              type="text"
              name="search"
              placeholder="Job title or skill..."
              value={filters.search}
              onChange={handleFilterChange}
              className="app-input"
            />
            <input
              type="text"
              name="company"
              placeholder="Company Name"
              value={filters.company}
              onChange={handleFilterChange}
              className="app-input"
            />
            <input
              type="text"
              name="skills"
              placeholder="Skills, comma separated"
              value={filters.skills}
              onChange={handleFilterChange}
              className="app-input"
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={filters.location}
              onChange={handleFilterChange}
              className="app-input"
            />
            <select
              name="jobType"
              value={filters.jobType}
              onChange={handleFilterChange}
              className="app-input"
            >
              <option value="">All Types</option>
              <option value="fulltime">Full Time</option>
              <option value="parttime">Part Time</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
            </select>
            <input
              type="number"
              name="salaryMin"
              placeholder="Min salary"
              value={filters.salaryMin}
              onChange={handleFilterChange}
              className="app-input"
            />
            <input
              type="number"
              name="salaryMax"
              placeholder="Max salary"
              value={filters.salaryMax}
              onChange={handleFilterChange}
              className="app-input"
            />
            <select
              name="daysPosted"
              value={filters.daysPosted}
              onChange={handleFilterChange}
              className="app-input"
            >
              <option value="">Any date</option>
              <option value="1">Last 24 hours</option>
              <option value="7">Last 7 days</option>
              <option value="14">Last 14 days</option>
              <option value="30">Last 30 days</option>
            </select>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="app-input"
            >
              <option value="newest">Newest</option>
              <option value="deadline">Deadline</option>
              <option value="salary_high">Highest salary</option>
              <option value="salary_low">Lowest salary</option>
            </select>
            <button type="submit" className="app-button whitespace-nowrap">Search Jobs</button>
            </form>
          </div>
        </div>
      </div>

      <div className="app-shell mx-auto max-w-5xl py-8">
        <p className="mb-5 text-sm font-medium text-stone-500">
          {isLoading ? "Searching..." : `${pagination.total} job${pagination.total !== 1 ? "s" : ""} found`}
        </p>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="app-panel p-6 animate-pulse">
                <div className="mb-3 h-4 w-1/3 rounded bg-stone-200" />
                <div className="mb-4 h-3 w-1/4 rounded bg-stone-200" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 rounded-full bg-stone-200" />
                  <div className="h-6 w-20 rounded-full bg-stone-200" />
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="app-empty">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-medium text-stone-700">No jobs found</p>
            <p className="mt-1 text-sm text-stone-400">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <article
                key={job._id}
                onClick={() => navigate(`/jobs/${job._id}`)}
                className="app-panel group cursor-pointer overflow-hidden p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-stone-900 transition-colors group-hover:text-blue-700">{job.title}</h3>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${jobTypeColors[job.jobType] || "bg-slate-100 text-slate-600"}`}>
                        {job.jobType}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-stone-600">{job.organization?.name || "Company Name Hidden"}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-stone-500">
                      <span>📍 {job.location}</span>
                      {job.salaryRange?.min && (
                        <span>💰 ₹{job.salaryRange.min.toLocaleString()} – ₹{job.salaryRange.max?.toLocaleString()}</span>
                      )}
                      <span>📅 {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {job.skillsRequired?.slice(0, 5).map((skill, i) => (
                        <span key={i} className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div className="hidden sm:flex shrink-0 flex-col items-end gap-3">
                    {user?.role === "jobseeker" && (
                      <button
                        type="button"
                        onClick={(event) => handleToggleSave(event, job._id)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          savedJobIds.includes(job._id)
                            ? "bg-amber-100 text-amber-800"
                            : "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {savedJobIds.includes(job._id) ? "Saved" : "Save Job"}
                      </button>
                    )}
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      View Details
                    </span>
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-semibold text-stone-400 transition-colors group-hover:bg-blue-600 group-hover:text-white">→</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!isLoading && pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-stone-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobSearch;
