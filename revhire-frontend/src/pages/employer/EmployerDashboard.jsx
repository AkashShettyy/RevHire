import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getEmployerJobs, deleteJob, updateJob } from "../../services/jobService";
import { useNavigate } from "react-router-dom";

const jobTypeColors = {
  fulltime: "bg-emerald-50 text-emerald-700",
  parttime: "bg-amber-50 text-amber-700",
  internship: "bg-purple-50 text-purple-700",
  remote: "bg-sky-50 text-sky-700",
};

function EmployerDashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { fetchJobs(); }, []);

  async function fetchJobs() {
    setIsLoading(true);
    try {
      const data = await getEmployerJobs(token);
      setJobs(data.jobs);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this job posting?")) return;
    try {
      await deleteJob(id, token);
      setMessage("Job deleted successfully");
      fetchJobs();
    } catch {
      setMessage("Something went wrong");
    }
  }

  async function handleToggleStatus(job) {
    try {
      await updateJob(job._id, { status: job.status === "open" ? "closed" : "open" }, token);
      setMessage(`Job ${job.status === "open" ? "closed" : "reopened"}`);
      setTimeout(() => setMessage(""), 3000);
      fetchJobs();
    } catch {
      setMessage("Something went wrong");
    }
  }

  const stats = [
    { label: "Total Jobs", value: jobs.length, color: "text-indigo-600", bg: "bg-indigo-50", icon: "📋" },
    { label: "Active", value: jobs.filter((j) => j.status === "open").length, color: "text-emerald-600", bg: "bg-emerald-50", icon: "✅" },
    { label: "Closed", value: jobs.filter((j) => j.status === "closed").length, color: "text-slate-500", bg: "bg-slate-100", icon: "🔒" },
  ];

  if (isLoading)
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
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name} 👋</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your job postings</p>
          </div>
          <button onClick={() => navigate("/employer/post-job")} className="btn-primary flex items-center gap-2">
            <span className="text-lg">+</span> Post a Job
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="card p-5">
              <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center text-lg mb-3`}>{s.icon}</div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-slate-500 text-sm mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {message && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-lg text-sm font-medium">
            ✅ {message}
          </div>
        )}

        {/* Job List */}
        <div>
          <h2 className="font-semibold text-slate-900 mb-4">Your Job Postings</h2>
          {jobs.length === 0 ? (
            <div className="card p-16 text-center">
              <p className="text-4xl mb-4">📭</p>
              <p className="text-slate-600 font-medium">No jobs posted yet</p>
              <p className="text-slate-400 text-sm mt-1 mb-6">Start attracting candidates by posting your first job</p>
              <button onClick={() => navigate("/employer/post-job")} className="btn-primary">Post Your First Job</button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job._id} className="card p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-slate-900">{job.title}</h3>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${job.status === "open" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                          {job.status === "open" ? "● Active" : "● Closed"}
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${jobTypeColors[job.jobType]}`}>{job.jobType}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                        <span>📍 {job.location}</span>
                        <span>📅 Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                        {job.salaryRange?.min && <span>💰 ₹{job.salaryRange.min.toLocaleString()} – ₹{job.salaryRange.max?.toLocaleString()}</span>}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {job.skillsRequired?.slice(0, 4).map((skill, i) => (
                          <span key={i} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full">{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={() => navigate(`/employer/applicants/${job._id}`)} className="btn-primary text-sm px-4 py-2 whitespace-nowrap">
                        View Applicants
                      </button>
                      <button
                        onClick={() => handleToggleStatus(job)}
                        className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${job.status === "open" ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100"}`}
                      >
                        {job.status === "open" ? "Close Job" : "Reopen Job"}
                      </button>
                      <button onClick={() => handleDelete(job._id)} className="text-sm font-semibold px-4 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployerDashboard;
