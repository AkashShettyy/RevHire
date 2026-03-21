import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getJobApplicants, updateApplicationStatus } from "../../services/applicationService";
import ResumePreview from "../../components/ResumePreview";
import { downloadResumePdf } from "../../utils/resumeDocument";

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
  const [selectedApplication, setSelectedApplication] = useState(null);

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
      <div className="app-page flex items-center justify-center">
        <div className="flex items-center gap-3 text-stone-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          Loading...
        </div>
      </div>
    );

  const shortlisted = applications.filter((a) => a.status === "shortlisted").length;
  const pending = applications.filter((a) => a.status === "applied").length;

  function handleResumeDownload(application) {
    if (!application?.resume) return;
    downloadResumePdf(application.jobSeeker, application.resume);
  }

  return (
    <div className="app-page">
      <div className="app-hero">
        <div className="app-shell max-w-5xl py-8">
          <div className="flex items-center gap-4">
          <button onClick={() => navigate("/employer/dashboard")} className="text-sm font-medium text-stone-500 transition-colors hover:text-blue-700">← Back</button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight text-stone-950">Applicants</h1>
              <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-sm font-semibold text-stone-600">{applications.length} total</span>
              {shortlisted > 0 && <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">{shortlisted} shortlisted</span>}
              {pending > 0 && <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">{pending} pending</span>}
            </div>
            <p className="mt-2 text-sm text-stone-500">Review resumes, read cover letters, and update applicant status from one place.</p>
          </div>
          </div>
        </div>
      </div>

      <div className="app-shell max-w-5xl py-8">
        {message && (
          <div className="app-message-success mb-5">{message.charAt(0).toUpperCase() + message.slice(1)}</div>
        )}

        {applications.length === 0 ? (
          <div className="app-empty">
            <p className="text-4xl mb-4">👥</p>
            <p className="font-medium text-stone-700">No applicants yet</p>
            <p className="mt-1 text-sm text-stone-400">Share your job posting to attract candidates</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="app-panel p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-sm font-bold text-blue-700">
                        {app.jobSeeker?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-stone-900">{app.jobSeeker?.name}</h3>
                        <p className="text-sm text-stone-500">{app.jobSeeker?.email}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-stone-400">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${statusColors[app.status]}`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>

                {app.resume && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedApplication(app)}
                      className="app-button-secondary px-4 py-2"
                    >
                      View Resume
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResumeDownload(app)}
                      className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                    >
                      Download Resume
                    </button>
                  </div>
                )}

                {!app.resume && (
                  <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    This applicant has not saved a resume yet.
                  </div>
                )}

                {app.coverLetter && (
                  <div className="mt-4 rounded-2xl border border-stone-200 bg-white/60 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">Cover Letter</p>
                    <p className="text-sm leading-relaxed text-stone-600">{app.coverLetter}</p>
                  </div>
                )}

                {app.status === "applied" && (
                  <div className="mt-4 flex gap-3 border-t border-stone-100 pt-4">
                    <button
                      onClick={() => handleStatusUpdate(app._id, "shortlisted")}
                      className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
                    >
                      ✅ Shortlist
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(app._id, "rejected")}
                      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-100"
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

      {selectedApplication && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 px-4 py-8 backdrop-blur-sm overflow-y-auto">
          <div className="mx-auto max-w-5xl">
            <div className="mb-4 flex flex-col gap-4 rounded-3xl border border-white/15 bg-slate-900/85 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">Applicant Resume</p>
                <h2 className="mt-1 text-2xl font-bold">{selectedApplication.jobSeeker?.name}</h2>
                <p className="mt-1 text-sm text-slate-300">{selectedApplication.jobSeeker?.email}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleResumeDownload(selectedApplication)}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
                >
                  Download Resume
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedApplication(null)}
                  className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Close
                </button>
              </div>
            </div>
            <ResumePreview user={selectedApplication.jobSeeker} resume={selectedApplication.resume} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Applicants;
