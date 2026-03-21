import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllJobs } from "../services/jobService";

const jobTypeColors = {
  fulltime: "bg-emerald-50 text-emerald-700",
  parttime: "bg-sky-50 text-sky-700",
  internship: "bg-purple-50 text-purple-700",
  remote: "bg-sky-50 text-sky-700",
};

function JobSearch() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({ search: "", location: "", jobType: "" });
  const navigate = useNavigate();

  useEffect(() => { fetchJobs(); }, []);

  async function fetchJobs() {
    setIsLoading(true);
    try {
      const data = await getAllJobs(filters);
      setJobs(data.jobs);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleFilterChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchJobs();
  }

  return (
    <div className="app-page">
      <div className="app-hero">
        <div className="app-shell py-10">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <span className="app-eyebrow">Job discovery</span>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-stone-950">Find roles that fit your search.</h1>
              <p className="mt-3 mb-8 text-center text-stone-500">Browse posted openings and narrow them by title, location, or job type.</p>
            </div>

            <form onSubmit={handleSearch} className="app-panel grid grid-cols-1 gap-3 p-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_auto]">
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
            <button type="submit" className="app-button whitespace-nowrap">Search Jobs</button>
            </form>
          </div>
        </div>
      </div>

      <div className="app-shell mx-auto max-w-5xl py-8">
        <p className="mb-5 text-sm font-medium text-stone-500">
          {isLoading ? "Searching..." : `${jobs.length} job${jobs.length !== 1 ? "s" : ""} found`}
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
                className="app-panel group cursor-pointer p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-stone-900 transition-colors group-hover:text-blue-700">{job.title}</h3>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${jobTypeColors[job.jobType] || "bg-slate-100 text-slate-600"}`}>
                        {job.jobType}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-stone-600">{job.employer?.name}</p>
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
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      View Details
                    </span>
                    <span className="text-xl text-stone-300 transition-colors group-hover:text-blue-700">→</span>
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

export default JobSearch;
