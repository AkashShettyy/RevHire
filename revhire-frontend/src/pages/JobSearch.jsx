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

const defaultFilters = {
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
};

const quickFilters = [
  { label: "Remote", changes: { jobType: "remote", page: 1 } },
  { label: "Internship", changes: { jobType: "internship", page: 1 } },
  { label: "Last 7 days", changes: { daysPosted: "7", page: 1 } },
  { label: "Salary high", changes: { sortBy: "salary_high", page: 1 } },
];

function formatSortLabel(value) {
  return String(value || "newest")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDeadline(value) {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "No deadline";

  const diffInDays = Math.ceil((timestamp - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffInDays < 0) return "Closed";
  if (diffInDays === 0) return "Closes today";
  if (diffInDays === 1) return "Closes tomorrow";
  return `${diffInDays} days left`;
}

function formatSalaryRange(range) {
  if (!range?.min) return "Salary not listed";

  const min = `₹${range.min.toLocaleString()}`;
  const max = range.max ? ` - ₹${range.max.toLocaleString()}` : "+";
  return `${min}${max}`;
}

function getActiveFilterEntries(filters) {
  const entries = [];

  if (filters.search) entries.push({ key: "search", label: `Search: ${filters.search}` });
  if (filters.company) entries.push({ key: "company", label: `Company: ${filters.company}` });
  if (filters.location) entries.push({ key: "location", label: `Location: ${filters.location}` });
  if (filters.skills) entries.push({ key: "skills", label: `Skills: ${filters.skills}` });
  if (filters.jobType) entries.push({ key: "jobType", label: `Type: ${filters.jobType}` });
  if (filters.daysPosted) entries.push({ key: "daysPosted", label: `Posted: last ${filters.daysPosted} days` });
  if (filters.salaryMin) entries.push({ key: "salaryMin", label: `Min salary: ₹${Number(filters.salaryMin).toLocaleString()}` });
  if (filters.salaryMax) entries.push({ key: "salaryMax", label: `Max salary: ₹${Number(filters.salaryMax).toLocaleString()}` });
  if (filters.sortBy !== "newest") entries.push({ key: "sortBy", label: `Sort: ${formatSortLabel(filters.sortBy)}` });

  return entries;
}

function JobSearch() {
  const { token, user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState(defaultFilters);
  const navigate = useNavigate();

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
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
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

  function handleQuickFilter(changes) {
    setFilters((current) => ({ ...current, ...changes }));
  }

  function handleRemoveFilter(key) {
    setFilters((current) => ({ ...current, [key]: defaultFilters[key], page: 1 }));
  }

  const activeFilters = getActiveFilterEntries(filters);

  return (
    <div className="app-shell">
      <div className="border-b border-white/50 bg-white/45 pt-8 pb-10 backdrop-blur-sm">
        <div className="layout-container">
          <div className="mx-auto max-w-7xl">
            <div className="page-hero grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <span className="eyebrow">Find Jobs</span>
                <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-surface-900 sm:text-5xl">
                  Browse opportunities with a cleaner search flow
                </h1>
                <p className="mt-3 max-w-2xl text-[15px] text-surface-700 sm:text-base">
                  Search by title, company, skill, location, salary, and recency. The layout keeps filters visible and the results easier to scan.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Open roles", value: isLoading ? "..." : pagination.total },
                  { label: "Saved", value: user?.role === "jobseeker" ? savedJobIds.length : "N/A" },
                  { label: "Sort", value: filters.sortBy.replace("_", " ") },
                ].map((item) => (
                  <div key={item.label} className="metric-tile">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-surface-500">{item.label}</p>
                    <p className="mt-3 font-display text-3xl font-semibold text-surface-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSearch} className="section-card mt-6 grid grid-cols-1 gap-5 p-6 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1fr]">
              <div className="xl:col-span-2">
                <label className="label-text">Search by role or keyword</label>
                <input type="text" name="search" placeholder="Frontend engineer, React, product designer..." value={filters.search} onChange={handleFilterChange} className="input-field" />
              </div>
              <div>
                <label className="label-text">Company</label>
                <input type="text" name="company" placeholder="Company name" value={filters.company} onChange={handleFilterChange} className="input-field" />
              </div>
              <div>
                <label className="label-text">Location</label>
                <input type="text" name="location" placeholder="City or remote" value={filters.location} onChange={handleFilterChange} className="input-field" />
              </div>
              <div>
                <label className="label-text">Skills</label>
                <input type="text" name="skills" placeholder="React, Node, SQL" value={filters.skills} onChange={handleFilterChange} className="input-field" />
              </div>
              <div>
                <label className="label-text">Job type</label>
                <select name="jobType" value={filters.jobType} onChange={handleFilterChange} className="input-field">
                  <option value="">All job types</option>
                  <option value="fulltime">Full time</option>
                  <option value="parttime">Part time</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
              <div>
                <label className="label-text">Date posted</label>
                <select name="daysPosted" value={filters.daysPosted} onChange={handleFilterChange} className="input-field">
                  <option value="">Any time</option>
                  <option value="1">Last 24 hours</option>
                  <option value="7">Last 7 days</option>
                  <option value="14">Last 14 days</option>
                  <option value="30">Last 30 days</option>
                </select>
              </div>
              <div>
                <label className="label-text">Sort by</label>
                <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange} className="input-field">
                  <option value="newest">Newest first</option>
                  <option value="deadline">Deadline soon</option>
                  <option value="salary_high">Salary high</option>
                  <option value="salary_low">Salary low</option>
                </select>
              </div>
              <div>
                <label className="label-text">Salary range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" name="salaryMin" placeholder="Min" value={filters.salaryMin} onChange={handleFilterChange} className="input-field" />
                  <input type="number" name="salaryMax" placeholder="Max" value={filters.salaryMax} onChange={handleFilterChange} className="input-field" />
                </div>
              </div>
              <div className="flex items-end gap-3 md:col-span-2 xl:col-span-4">
                <button type="submit" className="btn-primary px-8 py-3">
                  Find roles
                </button>
                <button
                  type="button"
                  onClick={() => setFilters(defaultFilters)}
                  className="btn-secondary px-6 py-3"
                >
                  Reset filters
                </button>
              </div>
            </form>

            <div className="section-card mt-4 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-surface-500">Quick refine</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {quickFilters.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleQuickFilter(item.changes)}
                        className="rounded-full border border-white/80 bg-white px-4 py-2 text-sm font-semibold text-surface-700 transition-colors hover:border-brand-200 hover:text-brand-700"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-brand-100 bg-brand-50/60 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">Search summary</p>
                  <p className="mt-1 text-sm font-semibold text-surface-800">
                    {isLoading ? "Refreshing results..." : `${pagination.total} roles across ${pagination.totalPages} page${pagination.totalPages !== 1 ? "s" : ""}`}
                  </p>
                </div>
              </div>

              {activeFilters.length > 0 && (
                <div className="mt-4 border-t border-surface-200/70 pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-surface-500">Active filters</span>
                    {activeFilters.map((filter) => (
                      <button
                        key={filter.key}
                        type="button"
                        onClick={() => handleRemoveFilter(filter.key)}
                        className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-sm font-semibold text-surface-700 transition-colors hover:border-brand-300 hover:text-brand-700"
                      >
                        <span>{filter.label}</span>
                        <span className="text-surface-400">×</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="layout-container mx-auto max-w-7xl py-16">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="heading-section">Jobs</h2>
            <p className="mt-2 text-sm text-surface-600">
              {isLoading ? "Searching..." : `${pagination.total} job${pagination.total !== 1 ? "s" : ""} found`}
            </p>
          </div>
          <div className="hidden rounded-full border border-white/80 bg-white/85 px-4 py-2 text-sm font-semibold text-surface-600 shadow-sm sm:block">
            Page {pagination.page} of {pagination.totalPages}
          </div>
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
            <h3 className="text-2xl font-bold text-surface-900 font-display mb-2">No jobs matched your criteria</h3>
            <p className="text-[15px] font-medium text-surface-700 max-w-md mx-auto">Try adjusting your search filters to find what you're looking for.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <article
                key={job._id}
                onClick={() => navigate(`/jobs/${job._id}`)}
                className="premium-card group cursor-pointer bg-white p-8"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="mb-4 flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-brand-50 via-white to-cyan-50 text-lg font-bold text-brand-700 shadow-sm">
                        {(job.organization?.name || job.title || "J").charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h3 className="mr-2 truncate font-display text-xl font-bold text-surface-900 transition-colors group-hover:text-brand-600">{job.title}</h3>
                          <span className={`badge ${jobTypeColors[job.jobType] || "badge-neutral"}`}>
                            {job.jobType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-[15px] font-bold text-surface-700">
                            {job.organization?.name || "Company Name Hidden"}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-5 flex flex-wrap gap-2 text-sm font-medium text-surface-700">
                      <span className="rounded-full border border-surface-200 bg-surface-50 px-3 py-1.5">
                        {job.location || "Location flexible"}
                      </span>
                      <span className="rounded-full border border-surface-200 bg-surface-50 px-3 py-1.5">
                        {formatSalaryRange(job.salaryRange)}
                      </span>
                      <span className="rounded-full border border-surface-200 bg-surface-50 px-3 py-1.5">
                        Deadline: {new Date(job.deadline).toLocaleDateString()}
                      </span>
                      <span className={`rounded-full px-3 py-1.5 ${formatDeadline(job.deadline) === "Closed" ? "border border-error-200 bg-error-50 text-error-700" : "border border-amber-200 bg-amber-50 text-amber-800"}`}>
                        {formatDeadline(job.deadline)}
                      </span>
                    </div>
                    <p className="max-w-3xl text-sm leading-6 text-surface-600">
                      {job.description?.slice(0, 180)}
                      {job.description?.length > 180 ? "..." : ""}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {job.skillsRequired?.slice(0, 6).map((skill, i) => (
                        <span key={i} className="rounded-full border border-surface-300 bg-white px-3 py-1 text-[13px] font-semibold text-surface-700 shadow-sm">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex w-full shrink-0 flex-row items-center gap-3 border-t border-surface-100 pt-4 sm:mt-0 sm:w-auto sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                    <span className="rounded-full bg-surface-950 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(16,28,45,0.18)]">
                      View details
                    </span>
                    {user?.role === "jobseeker" && (
                      <button
                        type="button"
                        onClick={(event) => handleToggleSave(event, job._id)}
                        className={`w-full sm:w-auto rounded-full px-5 py-2 text-sm font-bold border transition-colors ${
                          savedJobIds.includes(job._id)
                            ? "bg-brand-50 border-brand-200 text-brand-700"
                            : "bg-white border-surface-200 text-surface-600 hover:bg-surface-50"
                        }`}
                      >
                        {savedJobIds.includes(job._id) ? "Saved" : "Save Job"}
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
