import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAllJobs } from "../services/jobService";
import { useAuth } from "../context/AuthContext";
import { getSavedJobs, removeSavedJob, saveJob } from "../services/savedJobService";

const jobTypeColors = {
  fulltime: "badge-success",
  parttime: "badge-brand",
  internship: "badge-warning",
  remote: "badge-brand",
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
    <div className="app-shell">
      <div className="absolute top-0 right-0 -mr-40 h-[500px] w-full bg-brand-200/20 blur-[120px] pointer-events-none"></div>

      <div className="pt-10 pb-8 border-b border-surface-200/60 bg-white/40">
        <div className="layout-container">
          <div className="mx-auto max-w-7xl">
            <div className="page-hero">
              <div className="absolute -mr-20 -mt-20 right-0 top-0 h-96 w-96 rounded-full bg-brand-400/20 blur-[80px] pointer-events-none"></div>
              
              <div className="relative z-10 grid gap-10 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
                <div>
                  <span className="eyebrow">
                    Discover Your Next Role
                  </span>
                  <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-surface-900 sm:text-5xl">Find roles that fit perfectly.</h1>
                  <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-surface-700 font-medium">
                    Search and filter thousands of job postings by title, location, skills, compensation, and recency.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-surface-200 bg-white px-6 py-6">
                    <p className="text-[11px] font-bold uppercase tracking-normal text-surface-600">Results</p>
                    <p className="mt-2 font-display text-3xl font-bold text-surface-900">{pagination.total}</p>
                  </div>
                  <div className="rounded-xl border border-surface-200 bg-white px-6 py-6">
                    <p className="text-[11px] font-bold uppercase tracking-normal text-surface-600">Filters</p>
                    <p className="mt-2 font-display text-3xl font-bold text-surface-900">{activeFilterCount}</p>
                  </div>
                  <div className="rounded-xl border border-surface-200 bg-white px-6 py-6">
                    <p className="text-[11px] font-bold uppercase tracking-normal text-surface-600">Sort</p>
                    <p className="mt-2 font-display text-lg font-bold capitalize text-surface-900">{filters.sortBy.replace("_", " ")}</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSearch} className="section-card mt-10 grid grid-cols-1 items-center gap-4 p-7 md:grid-cols-2 xl:grid-cols-4 shadow-md shadow-surface-200/40">
              <input type="text" name="search" placeholder="Job title or skill..." value={filters.search} onChange={handleFilterChange} className="input-field bg-surface-50" />
              <input type="text" name="company" placeholder="Company Name" value={filters.company} onChange={handleFilterChange} className="input-field bg-surface-50" />
              <input type="text" name="skills" placeholder="Skills, comma separated" value={filters.skills} onChange={handleFilterChange} className="input-field bg-surface-50" />
              <input type="text" name="location" placeholder="Location" value={filters.location} onChange={handleFilterChange} className="input-field bg-surface-50" />
              <select name="jobType" value={filters.jobType} onChange={handleFilterChange} className="input-field bg-surface-50">
                <option value="">All Job Types</option>
                <option value="fulltime">Full Time</option>
                <option value="parttime">Part Time</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" name="salaryMin" placeholder="Min K" value={filters.salaryMin} onChange={handleFilterChange} className="input-field bg-surface-50" />
                <input type="number" name="salaryMax" placeholder="Max K" value={filters.salaryMax} onChange={handleFilterChange} className="input-field bg-surface-50" />
              </div>
              <select name="daysPosted" value={filters.daysPosted} onChange={handleFilterChange} className="input-field bg-surface-50">
                <option value="">Any Date Posted</option>
                <option value="1">Last 24 hours</option>
                <option value="7">Last 7 days</option>
                <option value="14">Last 14 days</option>
                <option value="30">Last 30 days</option>
              </select>
              <div className="flex gap-2">
                <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange} className="input-field bg-surface-50 flex-1">
                  <option value="newest">Newest First</option>
                  <option value="deadline">Deadline Soon</option>
                  <option value="salary_high">Salary (High)</option>
                  <option value="salary_low">Salary (Low)</option>
                </select>
                <button type="submit" className="btn-primary flex-1 shadow-brand-500/20">Find</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="layout-container mx-auto max-w-7xl py-16">
        <div className="mb-10 flex items-center justify-between">
          <h2 className="heading-section">Latest Opportunities</h2>
          <p className="text-sm font-bold uppercase tracking-wider text-surface-600">
            {isLoading ? "Searching..." : `${pagination.total} job${pagination.total !== 1 ? "s" : ""} found`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="premium-card p-6 animate-pulse bg-white">
                <div className="mb-4 h-5 w-1/3 rounded-lg bg-surface-200" />
                <div className="mb-5 h-4 w-1/4 rounded-lg bg-surface-200" />
                <div className="flex gap-3">
                  <div className="h-8 w-20 rounded-full bg-surface-200" />
                  <div className="h-8 w-24 rounded-full bg-surface-200" />
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="premium-card p-16 text-center bg-white border-none shadow-sm">
            <div className="inline-flex w-24 h-24 rounded-full bg-surface-50 items-center justify-center mb-6">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-2xl font-bold text-surface-900 font-display mb-2">No jobs matched your criteria</h3>
            <p className="text-[15px] font-medium text-surface-700 max-w-md mx-auto">Try adjusting your search filters to find what you're looking for.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <article
                key={job._id}
                onClick={() => navigate(`/jobs/${job._id}`)}
                className="premium-card group cursor-pointer bg-white p-8 hover:border-brand-200 hover:shadow-brand-500/5 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className="text-xl font-bold text-surface-900 font-display transition-colors group-hover:text-brand-600 truncate mr-2">{job.title}</h3>
                      <span className={`badge ${jobTypeColors[job.jobType] || "badge-neutral"}`}>
                        {job.jobType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <p className="text-[15px] font-bold text-surface-700">
                        {job.organization?.name || "Company Name Hidden"}
                      </p>
                    </div>
                    
                    <div className="mb-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-surface-700">
                      <span className="flex items-center gap-1.5">📍 {job.location}</span>
                      {job.salaryRange?.min && (
                        <span className="flex items-center gap-1.5">💰 ₹{job.salaryRange.min.toLocaleString()} – ₹{job.salaryRange.max?.toLocaleString()}</span>
                      )}
                      <span className="flex items-center gap-1.5">📅 {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {job.skillsRequired?.slice(0, 6).map((skill, i) => (
                        <span key={i} className="rounded-lg border border-surface-300 bg-surface-100 px-3 py-1 text-[13px] font-semibold text-surface-700">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-row sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-surface-100">
                    <span className="btn-primary w-full sm:w-auto px-6 py-2.5 text-sm">
                      View full details
                    </span>
                    {user?.role === "jobseeker" && (
                      <button
                        type="button"
                        onClick={(event) => handleToggleSave(event, job._id)}
                        className={`w-full sm:w-auto rounded-xl px-5 py-2 text-sm font-bold border transition-colors ${
                          savedJobIds.includes(job._id)
                            ? "bg-brand-50 border-brand-200 text-brand-700"
                            : "bg-white border-surface-200 text-surface-600 hover:bg-surface-50"
                        }`}
                      >
                        {savedJobIds.includes(job._id) ? "Saved to List" : "Save Job"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!isLoading && pagination.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="btn-secondary"
            >
              Previous
            </button>
            <div className="flex items-center justify-center px-4 py-2 font-bold text-surface-600 bg-white border border-surface-200 rounded-xl">
              {pagination.page} / {pagination.totalPages}
            </div>
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="btn-secondary"
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
