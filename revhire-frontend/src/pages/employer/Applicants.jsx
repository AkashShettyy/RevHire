import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getJobApplicants,
  updateApplicationStatus,
} from "../../services/applicationService";

function Applicants() {
  const { jobId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  async function fetchApplicants() {
    setIsLoading(true);
    try {
      const data = await getJobApplicants(jobId, token);
      setApplications(data.applications);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusUpdate(id, status) {
    try {
      await updateApplicationStatus(id, status, token);
      setMessage(`Candidate ${status} ✅`);
      fetchApplicants();
    } catch (error) {
      setMessage("Something went wrong");
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

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <button onClick={() => navigate("/employer/dashboard")}>← Back</button>
      <h1>Applicants</h1>
      {message && <p>{message}</p>}

      {applications.length === 0 ? (
        <p>No applicants yet</p>
      ) : (
        applications.map((app) => (
          <div key={app._id}>
            <h3>{app.jobSeeker?.name}</h3>
            <p>{app.jobSeeker?.email}</p>
            <p>Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
            {app.coverLetter && <p>Cover Letter: {app.coverLetter}</p>}
            <p style={{ color: getStatusColor(app.status) }}>
              Status: {app.status}
            </p>

            {app.status === "applied" && (
              <div>
                <button
                  onClick={() => handleStatusUpdate(app._id, "shortlisted")}
                >
                  Shortlist ✅
                </button>
                <button onClick={() => handleStatusUpdate(app._id, "rejected")}>
                  Reject ❌
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Applicants;
