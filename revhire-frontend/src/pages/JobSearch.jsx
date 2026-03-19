import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllJobs } from "../services/jobService";

const jobTypeColors = {
  fulltime: "bg-emerald-50 text-emerald-700",
  parttime: "bg-amber-50 text-amber-700",
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
    <div className="min-h-screen bg-slate-50">
      {/* Search Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 text-center">Find Your Dream Job</h1>
          <p className="text-slate-500 text-center mt-2 mb-8">Browse the latest openings and filter by role, location, or type.</p>

          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              name="search"
              placeholder="Job title or skill..."
              value={filters.search}
              onChange={handleFilterChange}
              className="input-field flex-1"
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={filters.location}
              onChange={handleFilterChange}
              className="input-field md:w-44"
            />
            <select
              name="jobType"
              value={filters.jobType}
              onChange={handleFilterChange}
              className="input-field md:w-40"
            >
              <option value="">All Types</option>
              <option value="fulltime">Full Time</option>
              <option value="parttime">Part Time</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
            </select>
            <button type="submit" className="btn-primary px-8 whitespace-nowrap">Search</button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <p className="text-slate-500 text-sm mb-5 font-medium">
          {isLoading ? "Searching..." : `${jobs.length} job${jobs.length !== 1 ? "s" : ""} found`}
        </p>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
                <div className="h-3 bg-slate-200 rounded w-1/4 mb-4" />
                <div className="flex gap-2">
                  <div className="h-6 bg-slate-200 rounded-full w-16" />
                  <div className="h-6 bg-slate-200 rounded-full w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="card p-16 text-center">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-slate-600 font-medium">No jobs found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                onClick={() => navigate(`/jobs/${job._id}`)}
                className="card p-6 hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${jobTypeColors[job.jobType] || "bg-slate-100 text-slate-600"}`}>
                        {job.jobType}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm mt-1">{job.employer?.name}</p>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                      <span>📍 {job.location}</span>
                      {job.salaryRange?.min && (
                        <span>💰 ₹{job.salaryRange.min.toLocaleString()} – ₹{job.salaryRange.max?.toLocaleString()}</span>
                      )}
                      <span>📅 {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {job.skillsRequired?.slice(0, 5).map((skill, i) => (
                        <span key={i} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <span className="text-slate-300 group-hover:text-indigo-400 transition-colors text-xl shrink-0">→</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobSearch;
