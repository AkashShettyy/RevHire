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
      setTimeout(() => setMessage(""), 3000);
      fetchApplicants();
    } catch (error) {
      setMessage("Something went wrong");
    }
  }

  const statusColors = {
    applied: "bg-blue-100 text-blue-700",
    shortlisted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    withdrawn: "bg-gray-100 text-gray-600",
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
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/employer/dashboard")}
            className="text-primary hover:underline text-sm"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
          <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
            {applications.length} total
          </span>
        </div>

        {message && (
          <p className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {message}
          </p>
        )}

        {applications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-gray-500">No applicants yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Share your job posting to attract candidates
            </p>
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
                    <h3 className="font-semibold text-gray-900">
                      {app.jobSeeker?.name}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {app.jobSeeker?.email}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[app.status]}`}
                  >
                    {app.status}
                  </span>
                </div>

                {app.coverLetter && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Cover Letter
                    </p>
                    <p className="text-gray-700 text-sm">{app.coverLetter}</p>
                  </div>
                )}

                {app.status === "applied" && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleStatusUpdate(app._id, "shortlisted")}
                      className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                    >
                      ✅ Shortlist
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(app._id, "rejected")}
                      className="bg-red-50 text-red-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Applicants;
