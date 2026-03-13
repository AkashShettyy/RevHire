import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById } from "../services/jobService";
import { applyForJob } from "../services/applicationService";
import { useAuth } from "../context/AuthContext";

function JobDetails() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchJob();
  }, [id]);

  async function fetchJob() {
    try {
      const data = await getJobById(id);
      setJob(data.job);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleApply(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await applyForJob(id, { coverLetter }, token);
      setMessage("Applied successfully! ✅");
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  if (!job) return <p>Loading...</p>;

  return (
    <div>
      <button onClick={() => navigate("/jobs")}>← Back</button>
      <h1>{job.title}</h1>
      <p>{job.employer?.name}</p>
      <p>
        {job.location} • {job.jobType}
      </p>
      <p>
        ₹{job.salaryRange?.min} - ₹{job.salaryRange?.max}
      </p>
      <p>Deadline: {new Date(job.deadline).toLocaleDateString()}</p>

      <h3>Description</h3>
      <p>{job.description}</p>

      <h3>Skills Required</h3>
      <div>
        {job.skillsRequired?.map((skill, i) => (
          <span key={i}>{skill}</span>
        ))}
      </div>

      <h3>Experience</h3>
      <p>{job.experienceRequired}</p>

      <h3>Education</h3>
      <p>{job.educationRequired}</p>

      {user?.role === "jobseeker" && job.status === "open" && (
        <form onSubmit={handleApply}>
          <h3>Apply for this job</h3>
          <textarea
            placeholder="Write a cover letter (optional)"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={4}
          />
          {message && <p>{message}</p>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Applying..." : "Apply Now"}
          </button>
        </form>
      )}
    </div>
  );
}

export default JobDetails;
