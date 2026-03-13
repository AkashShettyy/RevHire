import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getEmployerJobs,
  deleteJob,
  updateJob,
} from "../../services/jobService";
import { useNavigate } from "react-router-dom";

function EmployerDashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    setIsLoading(true);
    try {
      const data = await getEmployerJobs(token);
      setJobs(data.jobs);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await deleteJob(id, token);
      setMessage("Job deleted ✅");
      fetchJobs();
    } catch (error) {
      setMessage("Something went wrong");
    }
  }

  async function handleToggleStatus(job) {
    try {
      await updateJob(
        job._id,
        {
          status: job.status === "open" ? "closed" : "open",
        },
        token,
      );
      setMessage(`Job ${job.status === "open" ? "closed" : "reopened"} ✅`);
      fetchJobs();
    } catch (error) {
      setMessage("Something went wrong");
    }
  }

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <div>
        <h1>Employer Dashboard</h1>
        <button onClick={() => navigate("/employer/post-job")}>
          + Post a Job
        </button>
      </div>

      {message && <p>{message}</p>}

      {jobs.length === 0 ? (
        <p>No jobs posted yet</p>
      ) : (
        jobs.map((job) => (
          <div key={job._id}>
            <h3>{job.title}</h3>
            <p>
              {job.location} • {job.jobType}
            </p>
            <p>Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
            <span>{job.status}</span>

            <div>
              <button
                onClick={() => navigate(`/employer/applicants/${job._id}`)}
              >
                View Applicants
              </button>
              <button onClick={() => handleToggleStatus(job)}>
                {job.status === "open" ? "Close Job" : "Reopen Job"}
              </button>
              <button onClick={() => handleDelete(job._id)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default EmployerDashboard;
