import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById } from "../services/jobService";
import { applyForJob } from "../services/applicationService";
import { useAuth } from "../context/AuthContext";

const jobTypeColors = {
  fulltime: "bg-emerald-50 text-emerald-700",
  parttime: "bg-amber-50 text-amber-700",
  internship: "bg-purple-50 text-purple-700",
  remote: "bg-sky-50 text-sky-700",
};

function JobDetails() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => { fetchJob(); }, [id]);

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
      setIsApplied(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  if (!job)
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
        <div className="max-w-5xl mx-auto">
          <button onClick={() => navigate("/jobs")} className="mb-6 flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-blue-700">
            ← Back to Jobs
          </button>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            {/* Header Card */}
            <div className="card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="section-title text-2xl">{job.title}</h1>
                  <p className="text-slate-500 mt-1 font-medium">{job.employer?.name}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${jobTypeColors[job.jobType]}`}>{job.jobType}</span>
              </div>
              <div className="flex flex-wrap gap-5 mt-5 text-sm text-slate-500 pt-5 border-t border-slate-100">
                <span className="flex items-center gap-1.5">📍 {job.location}</span>
                {job.salaryRange?.min && <span className="flex items-center gap-1.5">💰 ₹{job.salaryRange.min.toLocaleString()} – ₹{job.salaryRange.max?.toLocaleString()}</span>}
                <span className="flex items-center gap-1.5">📅 Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="font-semibold text-slate-900 mb-3">Job Description</h2>
              <p className="text-slate-600 leading-relaxed text-sm">{job.description}</p>
            </div>

            {/* Skills */}
            <div className="card p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired?.map((skill, i) => (
                  <span key={i} className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">{skill}</span>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="card p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Requirements</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Experience</p>
                  <p className="text-slate-700 font-medium text-sm">{job.experienceRequired}</p>
                </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Education</p>
                  <p className="text-slate-700 font-medium text-sm">{job.educationRequired}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="card sticky top-20 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Apply for this role</h2>

              {job.status === "closed" ? (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm text-center font-medium">
                  This position is closed
                </div>
              ) : user?.role === "jobseeker" ? (
                isApplied ? (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-4 rounded-lg text-center">
                    <p className="text-2xl mb-2">🎉</p>
                    <p className="font-semibold text-sm">Application Submitted!</p>
                    <p className="text-xs text-emerald-600 mt-1">We'll notify you of any updates</p>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Cover Letter <span className="text-slate-400 font-normal">(optional)</span></label>
                      <textarea
                        placeholder="Tell the employer why you're a great fit..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={5}
                        className="input-field resize-none"
                      />
                    </div>
                    {message && (
                      <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-3 py-2.5 rounded-lg">{message}</div>
                    )}
                    <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
                      {isLoading ? "Submitting..." : "Submit Application"}
                    </button>
                  </form>
                )
              ) : (
                <div className="text-center py-4">
                  <p className="text-slate-500 text-sm mb-4">Sign in as a job seeker to apply</p>
                  <button onClick={() => navigate("/login")} className="btn-primary w-full py-2.5">Sign In to Apply</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetails;
