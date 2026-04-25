import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { createJob } from "../../services/jobService";
import { useNavigate } from "react-router-dom";

function PostJob() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "", description: "", skillsRequired: "",
    experienceRequired: "", educationRequired: "",
    location: "", salaryMin: "", salaryMax: "",
    jobType: "fulltime", deadline: "",
  });
  const [screeningQuestions, setScreeningQuestions] = useState([]);

  const addQuestion = () => setScreeningQuestions([...screeningQuestions, { question: "", requiredAnswer: "" }]);
  const updateQuestion = (index, field, value) => {
    const newQs = [...screeningQuestions];
    newQs[index][field] = value;
    setScreeningQuestions(newQs);
  };
  const removeQuestion = (index) => setScreeningQuestions(screeningQuestions.filter((_, i) => i !== index));

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createJob({
        ...formData,
        skillsRequired: formData.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean),
        salaryRange: { min: Number(formData.salaryMin), max: Number(formData.salaryMax) },
        screeningQuestions: screeningQuestions.filter(q => q.question.trim()),
      }, token);
      setMessage("success");
      setTimeout(() => navigate("/employer/dashboard"), 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="absolute top-0 right-0 -mr-40 h-[600px] w-[600px] rounded-full bg-brand-300/20 blur-[110px] pointer-events-none"></div>

      <div className="pt-10 pb-10 border-b border-surface-200/60 bg-white/50 backdrop-blur-md relative z-10">
        <div className="layout-container max-w-4xl">
          <div className="page-hero">
            <button onClick={() => navigate("/employer/dashboard")} className="mb-6 flex items-center gap-1.5 text-sm font-bold text-surface-700 transition-colors hover:text-brand-700"><span>←</span> Back</button>
            <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr] lg:items-end">
              <div>
                <span className="eyebrow mb-4">
                  Create opening
                </span>
                <h1 className="font-display text-3xl font-semibold tracking-tight text-surface-900 sm:text-4xl">Post a Job</h1>
                <p className="mt-3 text-[17px] font-medium text-surface-700">Fill in the details to attract the right candidates.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="metric-tile rounded-xl p-4 text-center ring-1 ring-white/70 sm:text-left">
                  <p className="text-[11px] font-bold uppercase tracking-normal text-surface-600">Template</p>
                  <p className="mt-1.5 text-[15px] font-bold text-surface-900">Structured form</p>
                </div>
                <div className="metric-tile rounded-xl p-4 text-center ring-1 ring-white/70 sm:text-left">
                  <p className="text-[11px] font-bold uppercase tracking-normal text-surface-600">Optional</p>
                  <p className="mt-1.5 text-[15px] font-bold text-surface-900">Screening Qs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="layout-container max-w-4xl py-10 relative z-10">
        {message === "success" && (
          <div className="rounded-xl border border-success-200 bg-success-50 p-4 font-semibold text-success-800 shadow-sm animate-fade-in mb-8">Job posted successfully. Redirecting...</div>
        )}
        {message && message !== "success" && (
          <div className="rounded-xl border border-error-200 bg-error-50 p-4 font-semibold text-error-800 shadow-sm animate-fade-in mb-8">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="premium-card bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold text-surface-900 font-display mb-6">📋 Basic Information</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-[13px] font-bold uppercase tracking-normal text-surface-500 mb-2">Job Title</label>
                <input type="text" name="title" placeholder="e.g. Senior React Developer" value={formData.title} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="block text-[13px] font-bold uppercase tracking-normal text-surface-500 mb-2">Description</label>
                <textarea name="description" placeholder="Describe the role, responsibilities, and what you're looking for..." value={formData.description} onChange={handleChange} rows={4} required className="input-field resize-none" />
              </div>
              <div>
                <label className="block text-[13px] font-bold uppercase tracking-normal text-surface-500 mb-2">Skills Required</label>
                <input type="text" name="skillsRequired" placeholder="React, Node.js, MongoDB (comma separated)" value={formData.skillsRequired} onChange={handleChange} required className="input-field" />
                <p className="mt-2 text-[13px] font-bold text-surface-600">Separate skills with commas</p>
              </div>
            </div>
          </div>

          <div className="premium-card bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-surface-900 font-display mb-6">📚 Requirements</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-bold uppercase tracking-normal text-surface-500 mb-2">Experience Required</label>
                <input type="text" name="experienceRequired" placeholder="e.g. 1-2 years" value={formData.experienceRequired} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="block text-[13px] font-bold uppercase tracking-normal text-surface-500 mb-2">Education Required</label>
                <input type="text" name="educationRequired" placeholder="e.g. Bachelor's degree" value={formData.educationRequired} onChange={handleChange} required className="input-field" />
              </div>
            </div>
          </div>

          <div className="premium-card bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-surface-900 font-display mb-6">💼 Job Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-bold uppercase tracking-normal text-surface-500 mb-2">Location</label>
                <input type="text" name="location" placeholder="e.g. Bangalore" value={formData.location} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="block text-[13px] font-bold uppercase tracking-normal text-surface-500 mb-2">Job Type</label>
                <select name="jobType" value={formData.jobType} onChange={handleChange} className="input-field">
                  <option value="fulltime">Full Time</option>
                  <option value="parttime">Part Time</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-bold uppercase tracking-normal text-surface-500 mb-2">Min Salary (₹)</label>
                <input type="number" name="salaryMin" placeholder="e.g. 500000" value={formData.salaryMin} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-[13px] font-bold uppercase tracking-normal text-surface-500 mb-2">Max Salary (₹)</label>
                <input type="number" name="salaryMax" placeholder="e.g. 800000" value={formData.salaryMax} onChange={handleChange} className="input-field" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[13px] font-bold uppercase tracking-normal text-surface-500 mb-2">Application Deadline</label>
                <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} required className="input-field" />
              </div>
            </div>
          </div>

          <div className="premium-card bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-surface-900 font-display flex items-center gap-2">🤖 Screening Qs <span className="text-[13px] font-bold uppercase tracking-normal text-surface-400 bg-surface-100 px-2 py-0.5 rounded ml-2">(Optional)</span></h2>
              <button type="button" onClick={addQuestion} className="text-[14px] font-bold text-brand-600 hover:text-brand-800 transition-colors flex items-center gap-1.5">
                <span className="text-lg leading-none">+</span> Add Question
              </button>
            </div>
            {screeningQuestions.length === 0 ? (
              <p className="rounded-xl border border-surface-300 bg-surface-100 p-6 text-center text-[15px] font-medium text-surface-700">Add questions to auto-filter candidates. If they provide the wrong answer to a required question, they will be auto-rejected.</p>
            ) : (
              <div className="space-y-4">
                {screeningQuestions.map((q, i) => (
                  <div key={i} className="flex gap-4 items-start border border-surface-200 p-5 rounded-2xl bg-surface-50 transition-colors focus-within:bg-white focus-within:border-brand-200">
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-[13px] font-bold uppercase tracking-normal text-surface-500 mb-2">Question</label>
                        <input type="text" value={q.question} onChange={(e) => updateQuestion(i, "question", e.target.value)} className="input-field" placeholder="e.g. Do you require visa sponsorship?" required />
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold uppercase tracking-normal text-surface-500 mb-2">Required Answer (Optional Knockout)</label>
                        <input type="text" value={q.requiredAnswer} onChange={(e) => updateQuestion(i, "requiredAnswer", e.target.value)} className="input-field" placeholder="e.g. No (Leave blank if not a strict filter)" />
                      </div>
                    </div>
                    <button type="button" onClick={() => removeQuestion(i)} className="text-[13px] font-bold text-error-500 transition-colors hover:text-error-600 bg-error-50 px-3 py-1.5 rounded-lg hover:bg-error-100 mt-7">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full py-4 text-lg">
            {isLoading ? "Posting..." : "Post Job"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostJob;
