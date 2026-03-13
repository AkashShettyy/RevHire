import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllJobs } from "../services/jobService";

function JobSearch() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    jobType: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

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

  const jobTypeColors = {
    fulltime: "bg-green-100 text-green-700",
    parttime: "bg-yellow-100 text-yellow-700",
    internship: "bg-purple-100 text-purple-700",
    remote: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 text-center">
            Find Your Dream Job
          </h1>
          <p className="text-slate-500 mt-2 mb-8 text-center">
            Browse the latest openings and filter by role, location, or type.
          </p>

          <form
            onSubmit={handleSearch}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-3 grid gap-3 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_0.8fr_auto]"
          >
            <input
              type="text"
              name="search"
              placeholder="Job title or skill"
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 text-slate-800 outline-none rounded-xl border border-slate-200 bg-white"
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={filters.location}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 text-slate-800 outline-none rounded-xl border border-slate-200 bg-white"
            />
            <select
              name="jobType"
              value={filters.jobType}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 text-slate-800 outline-none rounded-xl border border-slate-200 bg-white"
            >
              <option value="">All Types</option>
              <option value="fulltime">Full Time</option>
              <option value="parttime">Part Time</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
            </select>
            <button
              type="submit"
              className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-secondary transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-slate-500 mb-4 text-sm">
          {isLoading ? "Searching..." : `${jobs.length} jobs found`}
        </p>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
                <div className="h-3 bg-slate-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-slate-500 text-lg">No jobs found</p>
            <p className="text-slate-400 text-sm mt-1">Try different filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                onClick={() => navigate(`/jobs/${job._id}`)}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-primary transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {job.title}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">
                      {job.employer?.name}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${jobTypeColors[job.jobType] || "bg-gray-100 text-gray-600"}`}
                  >
                    {job.jobType}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
                  <span>📍 {job.location}</span>
                  <span>
                    💰 ₹{job.salaryRange?.min?.toLocaleString()} - ₹
                    {job.salaryRange?.max?.toLocaleString()}
                  </span>
                  <span>⏰ {new Date(job.deadline).toLocaleDateString()}</span>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {job.skillsRequired?.slice(0, 4).map((skill, i) => (
                    <span
                      key={i}
                      className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
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
