import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserApplications, withdrawApplication } from "../services/applicationService";
import { useNavigate } from "react-router-dom";

const statusColors = {
  applied: "bg-blue-50 text-blue-700 border border-blue-100",
  shortlisted: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  rejected: "bg-red-50 text-red-600 border border-red-100",
  withdrawn: "bg-slate-100 text-slate-500 border border-slate-200",
};

const jobTypeColors = {
  fulltime: "bg-emerald-50 text-emerald-700",
  parttime: "bg-amber-50 text-amber-700",
  internship: "bg-purple-50 text-purple-700",
  remote: "bg-sky-50 text-sky-700",
};

function ApplicationHistory() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { fetchApplications(); }, []);

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
      setMessage("Application withdrawn");
      setTimeout(() => setMessage(""), 3000);
      fetchApplications();
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  }

  if (isLoading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="page-shell border-b border-white/60 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="section-title text-2xl">My Applications</h1>
          <p className="text-slate-500 text-sm mt-1">{applications.length} total application{applications.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {message && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-lg mb-5 text-sm font-medium">
            ✅ {message}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="card p-16 text-center">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-slate-600 font-medium">No applications yet</p>
            <p className="text-slate-400 text-sm mt-1 mb-6">Start applying to jobs to track them here</p>
            <button onClick={() => navigate("/jobs")} className="btn-primary">Browse Jobs</button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3
                      className="cursor-pointer font-semibold text-slate-900 transition-colors hover:text-blue-700"
                      onClick={() => navigate(`/jobs/${app.job?._id}`)}
                    >
                      {app.job?.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                      <span>📍 {app.job?.location}</span>
                      <span>📅 Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                      {app.job?.jobType && (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${jobTypeColors[app.job.jobType]}`}>
                          {app.job.jobType}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${statusColors[app.status]}`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>

                {app.status === "applied" && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleWithdraw(app._id)}
                      className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                    >
                      Withdraw Application
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

export default ApplicationHistory;
