import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getUserApplications,
  withdrawApplication,
} from "../services/applicationService";
import { useNavigate } from "react-router-dom";

function ApplicationHistory() {
  const { token } = useAuth();
  const navigate = useNavigate();
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

  const statusColors = {
    applied: "bg-blue-100 text-blue-700",
    shortlisted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    withdrawn: "bg-gray-100 text-gray-600",
  };

  const jobTypeColors = {
    fulltime: "bg-green-100 text-green-700",
    parttime: "bg-yellow-100 text-yellow-700",
    internship: "bg-purple-100 text-purple-700",
    remote: "bg-blue-100 text-blue-700",
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          My Applications
        </h1>

        {message && (
          <p className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {message}
          </p>
        )}

        {applications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-500">No applications yet</p>
            <button
              onClick={() => navigate("/jobs")}
              className="mt-4 bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-secondary transition-colors"
            >
              Find Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app._id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3
                      className="font-semibold text-gray-900 hover:text-primary cursor-pointer"
                      onClick={() => navigate(`/jobs/${app.job?._id}`)}
                    >
                      {app.job?.title}
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                      <span>📍 {app.job?.location}</span>
                      <span>
                        📅 Applied{" "}
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${jobTypeColors[app.job?.jobType]}`}
                      >
                        {app.job?.jobType}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[app.status]}`}
                  >
                    {app.status}
                  </span>
                </div>

                {app.status === "applied" && (
                  <button
                    onClick={() => handleWithdraw(app._id)}
                    className="mt-4 text-red-500 text-sm hover:underline"
                  >
                    Withdraw Application
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicationHistory;
