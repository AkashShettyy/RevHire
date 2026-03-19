import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getJobApplicants, updateApplicationStatus } from "../../services/applicationService";

const statusColors = {
  applied: "bg-blue-50 text-blue-700 border border-blue-100",
  shortlisted: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  rejected: "bg-red-50 text-red-600 border border-red-100",
  withdrawn: "bg-slate-100 text-slate-500 border border-slate-200",
};

function Applicants() {
  const { jobId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { fetchApplicants(); }, [jobId]);

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
      setMessage(`Candidate ${status}`);
      setTimeout(() => setMessage(""), 3000);
      fetchApplicants();
    } catch {
      setMessage("Something went wrong");
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

  const shortlisted = applications.filter((a) => a.status === "shortlisted").length;
  const pending = applications.filter((a) => a.status === "applied").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate("/employer/dashboard")} className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors">← Back</button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">Applicants</h1>
              <span className="bg-slate-100 text-slate-600 text-sm font-semibold px-3 py-1 rounded-full">{applications.length} total</span>
              {shortlisted > 0 && <span className="bg-emerald-50 text-emerald-700 text-sm font-semibold px-3 py-1 rounded-full border border-emerald-100">{shortlisted} shortlisted</span>}
              {pending > 0 && <span className="bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full border border-blue-100">{pending} pending</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {message && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-lg mb-5 text-sm font-medium">
            ✅ {message.charAt(0).toUpperCase() + message.slice(1)}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="card p-16 text-center">
            <p className="text-4xl mb-4">👥</p>
            <p className="text-slate-600 font-medium">No applicants yet</p>
            <p className="text-slate-400 text-sm mt-1">Share your job posting to attract candidates</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="card p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {app.jobSeeker?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{app.jobSeeker?.name}</h3>
                        <p className="text-slate-500 text-sm">{app.jobSeeker?.email}</p>
                      </div>
                    </div>
                    <p className="text-slate-400 text-xs mt-3 ml-13">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${statusColors[app.status]}`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>

                {app.coverLetter && (
                  <div className="mt-4 bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Cover Letter</p>
                    <p className="text-slate-600 text-sm leading-relaxed">{app.coverLetter}</p>
                  </div>
                )}

                {app.status === "applied" && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleStatusUpdate(app._id, "shortlisted")}
                      className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-colors"
                    >
                      ✅ Shortlist
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(app._id, "rejected")}
                      className="bg-red-50 text-red-500 border border-red-100 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
                    >
                      ✕ Reject
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
