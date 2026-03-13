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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-2">Find Your Dream Job</h1>
          <p className="text-blue-100 mb-8">
            Thousands of jobs waiting for you
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl p-2 flex flex-wrap gap-2"
          >
            <input
              type="text"
              name="search"
              placeholder="Job title or skill"
              value={filters.search}
              onChange={handleFilterChange}
              className="flex-1 min-w-48 px-4 py-2 text-gray-800 outline-none rounded-xl"
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={filters.location}
              onChange={handleFilterChange}
              className="flex-1 min-w-32 px-4 py-2 text-gray-800 outline-none rounded-xl"
            />
            <select
              name="jobType"
              value={filters.jobType}
              onChange={handleFilterChange}
              className="px-4 py-2 text-gray-800 outline-none rounded-xl"
            >
              <option value="">All Types</option>
              <option value="fulltime">Full Time</option>
              <option value="parttime">Part Time</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
            </select>
            <button
              type="submit"
              className="bg-primary text-white px-6 py-2 rounded-xl font-semibold hover:bg-secondary transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-500 mb-4 text-sm">
          {isLoading ? "Searching..." : `${jobs.length} jobs found`}
        </p>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-500 text-lg">No jobs found</p>
            <p className="text-gray-400 text-sm mt-1">Try different filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                onClick={() => navigate(`/jobs/${job._id}`)}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {job.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {job.employer?.name}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${jobTypeColors[job.jobType] || "bg-gray-100 text-gray-600"}`}
                  >
                    {job.jobType}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
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
                      className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full"
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
