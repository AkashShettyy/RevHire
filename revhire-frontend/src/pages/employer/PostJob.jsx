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
    title: "",
    description: "",
    skillsRequired: "",
    experienceRequired: "",
    educationRequired: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    jobType: "fulltime",
    deadline: "",
  });

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createJob(
        {
          ...formData,
          skillsRequired: formData.skillsRequired
            .split(",")
            .map((s) => s.trim()),
          salaryRange: {
            min: Number(formData.salaryMin),
            max: Number(formData.salaryMax),
          },
        },
        token,
      );
      setMessage("Job posted successfully ✅");
      setTimeout(() => navigate("/employer/dashboard"), 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/employer/dashboard")}
            className="text-primary hover:underline text-sm"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Post a Job</h1>
        </div>

        {message && (
          <p
            className={`px-4 py-3 rounded-lg mb-4 text-sm ${
              message.includes("✅")
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-900">
              📋 Basic Information
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Senior React Developer"
                value={formData.title}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                placeholder="Describe the role, responsibilities..."
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills Required
              </label>
              <input
                type="text"
                name="skillsRequired"
                placeholder="React, Node.js, MongoDB (comma separated)"
                value={formData.skillsRequired}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-900">📚 Requirements</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Required
                </label>
                <input
                  type="text"
                  name="experienceRequired"
                  placeholder="e.g. 1-2 years"
                  value={formData.experienceRequired}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education Required
                </label>
                <input
                  type="text"
                  name="educationRequired"
                  placeholder="e.g. Bachelor's degree"
                  value={formData.educationRequired}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-900">💼 Job Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Bangalore"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type
                </label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="fulltime">Full Time</option>
                  <option value="parttime">Part Time</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Salary (₹)
                </label>
                <input
                  type="number"
                  name="salaryMin"
                  placeholder="e.g. 500000"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Salary (₹)
                </label>
                <input
                  type="number"
                  name="salaryMax"
                  placeholder="e.g. 800000"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-secondary transition-colors disabled:opacity-50 text-lg"
          >
            {isLoading ? "Posting..." : "Post Job"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostJob;
