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

  return (
    <div>
      <h1>Find Jobs</h1>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          name="search"
          placeholder="Search by title or skill"
          value={filters.search}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={filters.location}
          onChange={handleFilterChange}
        />
        <select
          name="jobType"
          value={filters.jobType}
          onChange={handleFilterChange}
        >
          <option value="">All Types</option>
          <option value="fulltime">Full Time</option>
          <option value="parttime">Part Time</option>
          <option value="internship">Internship</option>
          <option value="remote">Remote</option>
        </select>
        <button type="submit">Search</button>
      </form>

      {isLoading ? (
        <p>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p>No jobs found</p>
      ) : (
        <div>
          {jobs.map((job) => (
            <div key={job._id} onClick={() => navigate(`/jobs/${job._id}`)}>
              <h3>{job.title}</h3>
              <p>{job.employer?.name}</p>
              <p>{job.location}</p>
              <p>{job.jobType}</p>
              <p>
                ₹{job.salaryRange?.min} - ₹{job.salaryRange?.max}
              </p>
              <span>{job.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default JobSearch;
