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
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-8">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate("/employer/dashboard")} className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors">← Back</button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Post a Job</h1>
            <p className="text-slate-500 text-sm mt-0.5">Fill in the details to attract the right candidates</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {message === "success" && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
            ✅ Job posted successfully! Redirecting...
          </div>
        )}
        {message && message !== "success" && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            ⚠️ {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="card p-6 space-y-5">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">📋 Basic Information</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Title</label>
              <input type="text" name="title" placeholder="e.g. Senior React Developer" value={formData.title} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea name="description" placeholder="Describe the role, responsibilities, and what you're looking for..." value={formData.description} onChange={handleChange} rows={4} required className="input-field resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Skills Required</label>
              <input type="text" name="skillsRequired" placeholder="React, Node.js, MongoDB (comma separated)" value={formData.skillsRequired} onChange={handleChange} required className="input-field" />
              <p className="text-xs text-slate-400 mt-1.5">Separate skills with commas</p>
            </div>
          </div>

          {/* Requirements */}
          <div className="card p-6 space-y-5">
            <h2 className="font-semibold text-slate-900">📚 Requirements</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Experience Required</label>
                <input type="text" name="experienceRequired" placeholder="e.g. 1-2 years" value={formData.experienceRequired} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Education Required</label>
                <input type="text" name="educationRequired" placeholder="e.g. Bachelor's degree" value={formData.educationRequired} onChange={handleChange} required className="input-field" />
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="card p-6 space-y-5">
            <h2 className="font-semibold text-slate-900">💼 Job Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
                <input type="text" name="location" placeholder="e.g. Bangalore" value={formData.location} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Type</label>
                <select name="jobType" value={formData.jobType} onChange={handleChange} className="input-field">
                  <option value="fulltime">Full Time</option>
                  <option value="parttime">Part Time</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Min Salary (₹)</label>
                <input type="number" name="salaryMin" placeholder="e.g. 500000" value={formData.salaryMin} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Salary (₹)</label>
                <input type="number" name="salaryMax" placeholder="e.g. 800000" value={formData.salaryMax} onChange={handleChange} className="input-field" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Application Deadline</label>
                <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} required className="input-field" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 text-base">
            {isLoading ? "Posting..." : "Post Job"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostJob;
