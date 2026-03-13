import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getUserApplications,
  withdrawApplication,
} from "../services/applicationService";

function ApplicationHistory() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    setIsLoading(true);
    try {
      const data = await getUserApplications(token);
      setApplications(data.applications);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleWithdraw(id) {
    try {
      await withdrawApplication(id, token);
      setMessage("Application withdrawn ✅");
      fetchApplications();
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
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
      <h1>My Applications</h1>
      {message && <p>{message}</p>}

      {applications.length === 0 ? (
        <p>You haven't applied to any jobs yet</p>
      ) : (
        applications.map((app) => (
          <div key={app._id}>
            <h3>{app.job?.title}</h3>
            <p>
              {app.job?.location} • {app.job?.jobType}
            </p>
            <p>Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
            <p style={{ color: getStatusColor(app.status) }}>
              Status: {app.status}
            </p>
            {app.status === "applied" && (
              <button onClick={() => handleWithdraw(app._id)}>Withdraw</button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default ApplicationHistory;
