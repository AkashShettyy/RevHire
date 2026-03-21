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
    <div className="app-page">
      <div className="app-hero">
        <div className="app-shell max-w-3xl py-8">
          <div className="flex items-center gap-4">
          <button onClick={() => navigate("/employer/dashboard")} className="text-sm font-medium text-stone-500 transition-colors hover:text-blue-700">← Back</button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-stone-950">Post a Job</h1>
            <p className="mt-0.5 text-sm text-stone-500">Fill in the details to attract the right candidates.</p>
          </div>
          </div>
        </div>
      </div>

      <div className="app-shell max-w-3xl py-8">
        {message === "success" && (
          <div className="app-message-success mb-6">Job posted successfully. Redirecting...</div>
        )}
        {message && message !== "success" && (
          <div className="app-message-error mb-6">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="app-panel space-y-5 p-6 sm:p-8">
            <h2 className="flex items-center gap-2 font-semibold text-stone-900">📋 Basic Information</h2>
            <div>
              <label className="app-label">Job Title</label>
              <input type="text" name="title" placeholder="e.g. Senior React Developer" value={formData.title} onChange={handleChange} required className="app-input" />
            </div>
            <div>
              <label className="app-label">Description</label>
              <textarea name="description" placeholder="Describe the role, responsibilities, and what you're looking for..." value={formData.description} onChange={handleChange} rows={4} required className="app-input resize-none" />
            </div>
            <div>
              <label className="app-label">Skills Required</label>
              <input type="text" name="skillsRequired" placeholder="React, Node.js, MongoDB (comma separated)" value={formData.skillsRequired} onChange={handleChange} required className="app-input" />
              <p className="mt-1.5 text-xs text-stone-400">Separate skills with commas</p>
            </div>
          </div>

          <div className="app-panel space-y-5 p-6 sm:p-8">
            <h2 className="font-semibold text-stone-900">📚 Requirements</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="app-label">Experience Required</label>
                <input type="text" name="experienceRequired" placeholder="e.g. 1-2 years" value={formData.experienceRequired} onChange={handleChange} required className="app-input" />
              </div>
              <div>
                <label className="app-label">Education Required</label>
                <input type="text" name="educationRequired" placeholder="e.g. Bachelor's degree" value={formData.educationRequired} onChange={handleChange} required className="app-input" />
              </div>
            </div>
          </div>

          <div className="app-panel space-y-5 p-6 sm:p-8">
            <h2 className="font-semibold text-stone-900">💼 Job Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="app-label">Location</label>
                <input type="text" name="location" placeholder="e.g. Bangalore" value={formData.location} onChange={handleChange} required className="app-input" />
              </div>
              <div>
                <label className="app-label">Job Type</label>
                <select name="jobType" value={formData.jobType} onChange={handleChange} className="app-input">
                  <option value="fulltime">Full Time</option>
                  <option value="parttime">Part Time</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
              <div>
                <label className="app-label">Min Salary (₹)</label>
                <input type="number" name="salaryMin" placeholder="e.g. 500000" value={formData.salaryMin} onChange={handleChange} className="app-input" />
              </div>
              <div>
                <label className="app-label">Max Salary (₹)</label>
                <input type="number" name="salaryMax" placeholder="e.g. 800000" value={formData.salaryMax} onChange={handleChange} className="app-input" />
              </div>
              <div className="sm:col-span-2">
                <label className="app-label">Application Deadline</label>
                <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} required className="app-input" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="app-button w-full py-3.5 text-base">
            {isLoading ? "Posting..." : "Post Job"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostJob;
