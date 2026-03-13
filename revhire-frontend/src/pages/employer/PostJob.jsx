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

  return (
    <div>
      <h1>Post a Job</h1>
      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Job title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Job description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          required
        />
        <input
          type="text"
          name="skillsRequired"
          placeholder="Skills (comma separated: React, Node.js, MongoDB)"
          value={formData.skillsRequired}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="experienceRequired"
          placeholder="Experience required (e.g. 1-2 years)"
          value={formData.experienceRequired}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="educationRequired"
          placeholder="Education required (e.g. Bachelor's degree)"
          value={formData.educationRequired}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="salaryMin"
          placeholder="Min salary"
          value={formData.salaryMin}
          onChange={handleChange}
        />
        <input
          type="number"
          name="salaryMax"
          placeholder="Max salary"
          value={formData.salaryMax}
          onChange={handleChange}
        />
        <select name="jobType" value={formData.jobType} onChange={handleChange}>
          <option value="fulltime">Full Time</option>
          <option value="parttime">Part Time</option>
          <option value="internship">Internship</option>
          <option value="remote">Remote</option>
        </select>
        <input
          type="date"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Posting..." : "Post Job"}
        </button>
      </form>
    </div>
  );
}

export default PostJob;
