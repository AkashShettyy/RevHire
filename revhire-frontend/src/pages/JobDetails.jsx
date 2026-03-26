import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById } from "../services/jobService";
import { applyForJob } from "../services/applicationService";
import { useAuth } from "../context/AuthContext";
import { getResume } from "../services/resumeService";
import { removeSavedJob, saveJob, getSavedJobs } from "../services/savedJobService";

const jobTypeColors = {
  fulltime: "bg-emerald-50 text-emerald-700",
  parttime: "bg-sky-50 text-sky-700",
  internship: "bg-purple-50 text-purple-700",
  remote: "bg-sky-50 text-sky-700",
};

function JobDetails() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isApplied, setIsApplied] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      const data = await getJobById(id);
      setJob(data.job);
    } catch (error) {
      console.error(error);
    }
  }, [id]);

  const fetchResumes = useCallback(async () => {
    try {
      const data = await getResume(token);
      setResumes(data.resumes || []);
      setSelectedResumeId(data.resume?._id || "");
    } catch {
      setResumes([]);
      setSelectedResumeId("");
    }
  }, [token]);

  const fetchSavedState = useCallback(async () => {
    try {
      const data = await getSavedJobs(token);
      setIsSaved(data.savedJobs.some((entry) => entry.job?._id === id));
    } catch {
      setIsSaved(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchJob();
    if (user?.role === "jobseeker" && token) {
      fetchResumes();
      fetchSavedState();
    }
  }, [fetchJob, fetchResumes, fetchSavedState, token, user]);

  async function handleApply(e) {
    e.preventDefault();
    setIsLoading(true);

    const formattedAnswers = job.screeningQuestions?.map(q => ({
      question: q.question,
      answer: answers[q.question] || ""
    })) || [];

    try {
      await applyForJob(id, { coverLetter, answers: formattedAnswers, resumeVersionId: selectedResumeId || undefined }, token);
      setIsApplied(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleSavedJob() {
    try {
      if (isSaved) {
        await removeSavedJob(id, token);
        setIsSaved(false);
      } else {
        await saveJob(id, token);
        setIsSaved(true);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to update saved jobs.");
    }
  }

  if (!job)
    return (
      <div className="app-page flex items-center justify-center">
        <div className="flex items-center gap-3 text-stone-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          Loading...
        </div>
      </div>
    );

  return (
    <div className="app-page">
      <div className="app-hero">
        <div className="app-shell max-w-5xl py-8">
          <button onClick={() => navigate("/jobs")} className="mb-6 flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-blue-700">
            ← Back to Jobs
          </button>
        </div>
      </div>
      <div className="app-shell max-w-5xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="app-panel p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-stone-950">{job.title}</h1>
                  <p className="mt-1 font-medium text-stone-500">{job.organization?.name || "Company Name Hidden"}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${jobTypeColors[job.jobType]}`}>{job.jobType}</span>
                  {user?.role === "jobseeker" && (
                    <button
                      type="button"
                      onClick={handleToggleSavedJob}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isSaved ? "bg-amber-100 text-amber-800" : "bg-stone-100 text-stone-700"
                      }`}
                    >
                      {isSaved ? "Saved" : "Save Job"}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-5 mt-5 border-t border-stone-100 pt-5 text-sm text-stone-500">
                <span className="flex items-center gap-1.5">📍 {job.location}</span>
                {job.salaryRange?.min && <span className="flex items-center gap-1.5">💰 ₹{job.salaryRange.min.toLocaleString()} – ₹{job.salaryRange.max?.toLocaleString()}</span>}
                <span className="flex items-center gap-1.5">📅 Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="app-panel p-6">
              <h2 className="mb-3 font-semibold text-stone-900">Job Description</h2>
              <p className="text-sm leading-relaxed text-stone-600">{job.description}</p>
            </div>

            <div className="app-panel p-6">
              <h2 className="mb-4 font-semibold text-stone-900">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired?.map((skill, i) => (
                  <span key={i} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">{skill}</span>
                ))}
              </div>
            </div>

            <div className="app-panel p-6">
              <h2 className="mb-4 font-semibold text-stone-900">Requirements</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-stone-200 bg-white/70 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">Experience</p>
                  <p className="text-sm font-medium text-stone-700">{job.experienceRequired}</p>
                </div>
                  <div className="rounded-2xl border border-stone-200 bg-white/70 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">Education</p>
                  <p className="text-sm font-medium text-stone-700">{job.educationRequired}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="app-panel sticky top-24 p-6">
              <h2 className="mb-4 font-semibold text-stone-900">Apply for this role</h2>

              {job.status === "closed" ? (
                <div className="app-message-error text-center font-medium">
                  This position is closed
                </div>
              ) : user?.role === "jobseeker" ? (
                isApplied ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-center text-emerald-700">
                    <p className="text-2xl mb-2">🎉</p>
                    <p className="font-semibold text-sm">Application Submitted!</p>
                    <p className="text-xs text-emerald-600 mt-1">We'll notify you of any updates</p>
                  </div>
                ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <label className="app-label">Resume Version</label>
                    <select
                      value={selectedResumeId}
                      onChange={(event) => setSelectedResumeId(event.target.value)}
                      className="app-input"
                      disabled={resumes.length === 0}
                    >
                      {resumes.length === 0 ? (
                        <option value="">No resume versions available</option>
                      ) : (
                        resumes.map((resume) => (
                          <option key={resume._id} value={resume._id}>
                            {resume.title}{resume.isDefault ? " (Default)" : ""}
                          </option>
                        ))
                      )}
                    </select>
                    {resumes.length === 0 && (
                      <p className="mt-2 text-xs text-stone-500">
                        Create a resume in the builder before applying.
                      </p>
                    )}
                  </div>
                  {job.screeningQuestions?.length > 0 && (
                    <div className="space-y-4 pt-2 pb-4 border-b border-stone-100">
                      <h3 className="text-sm font-semibold text-stone-800">Screening Questions</h3>
                      {job.screeningQuestions.map((q, i) => (
                        <div key={i}>
                          <label className="app-label break-words whitespace-pre-wrap">{q.question}</label>
                          <input
                            type="text"
                            required
                            value={answers[q.question] || ""}
                            onChange={(e) => setAnswers(prev => ({...prev, [q.question]: e.target.value}))}
                            className="app-input"
                            placeholder="Your answer"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <div>
                    <label className="app-label">Cover Letter <span className="font-normal text-stone-400">(optional)</span></label>
                      <textarea
                        placeholder="Tell the employer why you're a great fit..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={5}
                        className="app-input resize-none"
                      />
                    </div>
                    {message && (
                      <div className="app-message-error">{message}</div>
                    )}
                    <button type="submit" disabled={isLoading || resumes.length === 0} className="app-button w-full py-3">
                      {isLoading ? "Submitting..." : "Submit Application"}
                    </button>
                  </form>
                )
              ) : (
                <div className="text-center py-4">
                  <p className="mb-4 text-sm text-stone-500">Sign in as a job seeker to apply</p>
                  <button onClick={() => navigate("/login")} className="app-button w-full py-2.5">Sign In to Apply</button>
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
