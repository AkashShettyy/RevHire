import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById } from "../services/jobService";
import { applyForJob } from "../services/applicationService";
import { useAuth } from "../context/AuthContext";
import { getResume } from "../services/resumeService";
import { removeSavedJob, saveJob, getSavedJobs } from "../services/savedJobService";

const jobTypeColors = {
  fulltime: "badge-success",
  parttime: "badge-brand",
  internship: "badge-warning",
  remote: "badge-brand",
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
    <div className="app-shell">
      <div className="absolute top-0 right-0 -mr-40 h-[600px] w-[600px] rounded-full bg-brand-300/20 blur-[110px] pointer-events-none"></div>

      <div className="relative border-b border-surface-200/60 bg-white/50 pb-12 pl-8 pr-8 pt-8 backdrop-blur-md">
        <div className="layout-container max-w-5xl">
          <button onClick={() => navigate("/jobs")} className="flex items-center gap-1.5 text-sm font-bold text-surface-500 hover:text-brand-700 transition-colors mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
            Back to Jobs
          </button>
          
          <div className="page-hero mt-2 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <span className="eyebrow mb-4">
                Role Details
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-surface-900 sm:text-4xl">{job.title}</h1>
              <p className="mt-3 flex items-center gap-2 text-[17px] font-medium text-surface-600">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-100 text-xs font-bold text-brand-700">{job.organization?.name?.charAt(0) || "C"}</span>
                {job.organization?.name || "Company Name Hidden"}
              </p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-3 md:min-w-[360px]">
              <div className="rounded-2xl border border-brand-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
                <p className="text-[11px] font-bold uppercase tracking-widest text-surface-500">Location</p>
                <p className="mt-2 truncate text-sm font-bold text-surface-900">{job.location}</p>
              </div>
              <div className="rounded-2xl border border-brand-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
                <p className="text-[11px] font-bold uppercase tracking-widest text-surface-500">Type</p>
                <p className="mt-2 text-sm font-bold capitalize text-surface-900">{job.jobType}</p>
              </div>
              <div className="rounded-2xl border border-brand-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
                <p className="text-[11px] font-bold uppercase tracking-widest text-surface-500">Deadline</p>
                <p className="mt-2 text-sm font-bold text-surface-900">{new Date(job.deadline).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="layout-container max-w-5xl py-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="premium-card p-8 bg-white shadow-sm border-surface-200">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-surface-900 font-['Outfit']">Overview</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${jobTypeColors[job.jobType] || 'badge-neutral'}`}>{job.jobType}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-4 pt-6 border-t border-surface-100 text-[15px] font-medium text-surface-600">
                <span className="flex items-center gap-2"><span className="text-xl">📍</span> {job.location}</span>
                {job.salaryRange?.min && <span className="flex items-center gap-2"><span className="text-xl">💰</span> ₹{job.salaryRange.min.toLocaleString()} – ₹{job.salaryRange.max?.toLocaleString()}</span>}
                <span className="flex items-center gap-2"><span className="text-xl">📅</span> Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="premium-card p-8 bg-white shadow-sm border-surface-200">
              <h2 className="text-xl font-bold text-surface-900 font-['Outfit'] mb-4">Job Description</h2>
              <div className="prose prose-stone text-[15px] leading-relaxed text-surface-600 max-w-none whitespace-pre-line">
                {job.description}
              </div>
            </div>

            <div className="premium-card p-8 bg-white shadow-sm border-surface-200">
              <h2 className="text-xl font-bold text-surface-900 font-['Outfit'] mb-5">Skills Required</h2>
              <div className="flex flex-wrap gap-2.5">
                {job.skillsRequired?.map((skill, i) => (
                  <span key={i} className="rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-2 text-sm font-bold text-brand-700">{skill}</span>
                ))}
              </div>
            </div>

            <div className="premium-card p-8 bg-white shadow-sm border-surface-200">
              <h2 className="text-xl font-bold text-surface-900 font-['Outfit'] mb-5">Requirements</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="rounded-2xl border border-surface-100 bg-surface-50/50 p-5">
                  <div className="w-10 h-10 rounded-xl bg-surface-200 text-surface-600 flex items-center justify-center mb-3 text-lg font-bold">⏱</div>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-surface-400">Experience</p>
                  <p className="text-[15px] font-bold text-surface-800">{job.experienceRequired}</p>
                </div>
                  <div className="rounded-2xl border border-surface-100 bg-surface-50/50 p-5">
                  <div className="w-10 h-10 rounded-xl bg-surface-200 text-surface-600 flex items-center justify-center mb-3 text-lg font-bold">🎓</div>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-surface-400">Education</p>
                  <p className="text-[15px] font-bold text-surface-800">{job.educationRequired}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="premium-card sticky top-28 overflow-hidden p-8 bg-white shadow-lg shadow-surface-200/50 border-surface-200">
              <h2 className="text-xl font-bold text-surface-900 font-['Outfit'] mb-6">Apply for this role</h2>

              <div className="mb-6 flex gap-3">
                 {user?.role === "jobseeker" && (
                    <button
                      type="button"
                      onClick={handleToggleSavedJob}
                      className={`flex-1 rounded-xl py-2.5 text-sm font-bold border transition-colors ${
                        isSaved ? "bg-brand-50 border-brand-200 text-brand-700" : "bg-white border-surface-200 text-surface-600 hover:bg-surface-50"
                      }`}
                    >
                      {isSaved ? "Saved to List" : "Save for Later"}
                    </button>
                  )}
              </div>

              {job.status === "closed" ? (
                <div className="rounded-xl border border-error-200 bg-error-50 p-5 text-center font-bold text-error-700">
                  This position is currently closed
                </div>
              ) : user?.role === "jobseeker" ? (
                isApplied ? (
                  <div className="rounded-2xl border border-success-200 bg-success-50 p-6 text-center shadow-inner">
                    <p className="text-4xl mb-3">🎉</p>
                    <p className="font-bold text-lg text-success-800 tracking-tight">Application Submitted!</p>
                    <p className="text-[13px] font-medium text-success-700 mt-2">You can track the status in your dashboard.</p>
                  </div>
                ) : (
                <form onSubmit={handleApply} className="space-y-5">
                  <div>
                    <label className="label-text">Select Resume Version</label>
                    <select
                      value={selectedResumeId}
                      onChange={(event) => setSelectedResumeId(event.target.value)}
                      className="input-field"
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
                      <p className="mt-2 text-xs font-medium text-surface-500 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        Create a resume in the builder before applying.
                      </p>
                    )}
                  </div>
                  {job.screeningQuestions?.length > 0 && (
                    <div className="space-y-5 pt-3 pb-5 border-y border-surface-100 mt-5">
                      <h3 className="text-[13px] font-bold uppercase tracking-widest text-surface-600">Screening Questions</h3>
                      {job.screeningQuestions.map((q, i) => (
                        <div key={i}>
                          <label className="label-text break-words whitespace-pre-wrap">{q.question}</label>
                          <input
                            type="text"
                            required
                            value={answers[q.question] || ""}
                            onChange={(e) => setAnswers(prev => ({...prev, [q.question]: e.target.value}))}
                            className="input-field mt-1.5"
                            placeholder="Your answer"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <div>
                    <label className="label-text flex items-center justify-between">
                      Cover Letter 
                      <span className="font-semibold text-surface-400 text-xs tracking-normal normal-case">Optional</span>
                    </label>
                      <textarea
                        placeholder="Tell the employer why you're a great fit..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={4}
                        className="input-field resize-none mt-1.5"
                      />
                    </div>
                    {message && (
                      <div className="flex items-center gap-2 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm font-semibold text-error-700 animate-fade-in">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        {message}
                      </div>
                    )}
                    <button type="submit" disabled={isLoading || resumes.length === 0} className="btn-primary w-full py-3.5 mt-2 bg-gradient-to-r from-brand-600 to-indigo-600 shadow-brand-500/30 font-bold text-[15px]">
                      {isLoading ? "Submitting..." : "Submit Application"}
                    </button>
                  </form>
                )
              ) : (
                <div className="rounded-2xl border border-surface-100 bg-surface-50 p-6 text-center">
                  <p className="mb-5 text-[15px] font-medium text-surface-600">You must be signed in as a job seeker to apply for this role.</p>
                  <button onClick={() => navigate("/login")} className="btn-primary w-full shadow-brand-500/20">Sign In to Apply</button>
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
