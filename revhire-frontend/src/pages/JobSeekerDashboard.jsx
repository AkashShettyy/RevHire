import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserApplications } from "../services/applicationService";
import { getAllJobs } from "../services/jobService";
import { useNavigate } from "react-router-dom";

function JobSeekerDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [appsData, jobsData] = await Promise.all([
        getUserApplications(token),
        getAllJobs(),
      ]);
      setApplications(appsData.applications);
      setRecentJobs(jobsData.jobs.slice(0, 5));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case "applied":
        return "blue";
      case "shortlisted":
        return "green";
      case "rejected":
        return "red";
      case "withdrawn":
        return "gray";
      default:
        return "black";
    }
  }

  const stats = {
    total: applications.length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    applied: applications.filter((a) => a.status === "applied").length,
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Welcome back, {user?.name}! 👋</h1>

      {/* Stats */}
      <div>
        <div>
          <h3>Total Applied</h3>
          <p>{stats.total}</p>
        </div>
        <div>
          <h3>Shortlisted</h3>
          <p>{stats.shortlisted}</p>
        </div>
        <div>
          <h3>Pending</h3>
          <p>{stats.applied}</p>
        </div>
        <div>
          <h3>Rejected</h3>
          <p>{stats.rejected}</p>
        </div>
      </div>

      {/* Recent Applications */}
      <section>
        <div>
          <h2>Recent Applications</h2>
          <button onClick={() => navigate("/applications")}>View All</button>
        </div>
        {applications.length === 0 ? (
          <p>
            No applications yet —{" "}
            <button onClick={() => navigate("/jobs")}>Find Jobs</button>
          </p>
        ) : (
          applications.slice(0, 3).map((app) => (
            <div key={app._id}>
              <h3>{app.job?.title}</h3>
              <p>
                {app.job?.location} • {app.job?.jobType}
              </p>
              <p style={{ color: getStatusColor(app.status) }}>{app.status}</p>
            </div>
          ))
        )}
      </section>

      {/* Recent Jobs */}
      <section>
        <div>
          <h2>Recent Jobs</h2>
          <button onClick={() => navigate("/jobs")}>View All</button>
        </div>
        {recentJobs.map((job) => (
          <div key={job._id} onClick={() => navigate(`/jobs/${job._id}`)}>
            <h3>{job.title}</h3>
            <p>{job.employer?.name}</p>
            <p>
              {job.location} • {job.jobType}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default JobSeekerDashboard;
