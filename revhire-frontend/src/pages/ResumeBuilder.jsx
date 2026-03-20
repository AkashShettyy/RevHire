import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getResume, saveResume } from "../services/resumeService";
import ResumePreview from "../components/ResumePreview";
import { downloadResumePdf } from "../utils/resumeDocument";

const inputClass = "input-field";

function Section({ title, children }) {
  return (
    <div className="form-panel">
      <h2 className="mb-5 font-semibold text-slate-900">{title}</h2>
      {children}
    </div>
  );
}

function AddButton({ onClick, label }) {
  return (
    <button type="button" onClick={onClick} className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">
      + {label}
    </button>
  );
}

function RemoveButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="text-xs font-medium text-red-400 transition-colors hover:text-red-600">
      Remove
    </button>
  );
}

function ResumeBuilder() {
  const { token, user } = useAuth();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [resume, setResume] = useState({
    objective: "",
    education: [{ institution: "", degree: "", year: "" }],
    experience: [{ company: "", role: "", duration: "", description: "" }],
    skills: [""],
    projects: [{ name: "", description: "", link: "" }],
    certifications: [""],
  });

  useEffect(() => { fetchResume(); }, []);

  async function fetchResume() {
    try {
      const data = await getResume(token);
      setResume(data.resume);
    } catch {
      // no resume yet
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await saveResume(resume, token);
      setMessage("saved");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("error");
    } finally {
      setIsLoading(false);
    }
  }

  function updateField(field, value) { setResume({ ...resume, [field]: value }); }
  function updateArrayField(field, index, key, value) {
    const updated = [...resume[field]];
    updated[index] = { ...updated[index], [key]: value };
    setResume({ ...resume, [field]: updated });
  }
  function addItem(field, emptyItem) { setResume({ ...resume, [field]: [...resume[field], emptyItem] }); }
  function removeItem(field, index) { setResume({ ...resume, [field]: resume[field].filter((_, i) => i !== index) }); }

  async function handleDownloadPdf() {
    setIsDownloading(true);
    try {
      downloadResumePdf(user, resume);
    } catch {
      setMessage("error");
    } finally {
      setTimeout(() => setIsDownloading(false), 800);
    }
  }

  function handleFormKeyDown(event) {
    if (event.key === "Enter" && event.target.tagName !== "TEXTAREA") {
      event.preventDefault();
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="page-shell border-b border-white/60 px-6 py-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="section-title text-2xl">Resume Builder</h1>
            <p className="text-slate-500 text-sm mt-1">Build your professional profile</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Preview Resume
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="btn-primary px-4 py-2 text-sm"
            >
              {isDownloading ? "Preparing PDF..." : "Download PDF"}
            </button>
          </div>
          {message === "saved" && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium">
              ✅ Saved successfully
            </div>
          )}
          {message === "error" && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-lg text-sm">
              Something went wrong
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSave} onKeyDown={handleFormKeyDown} className="space-y-6">
          {/* Objective */}
          <Section title="🎯 Professional Objective">
            <textarea
              placeholder="Write a short professional summary..."
              value={resume.objective}
              onChange={(e) => updateField("objective", e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </Section>

          {/* Skills */}
          <Section title="⚡ Skills">
            <div className="flex flex-wrap gap-2 mb-3">
              {resume.skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Skill"
                    value={skill}
                    onChange={(e) => {
                      const updated = [...resume.skills];
                      updated[i] = e.target.value;
                      updateField("skills", updated);
                    }}
                    className="w-24 bg-transparent text-sm font-medium text-blue-700 outline-none"
                  />
                  <button type="button" onClick={() => removeItem("skills", i)} className="text-xs font-bold text-blue-300 transition-colors hover:text-red-500">✕</button>
                </div>
              ))}
            </div>
            <AddButton onClick={() => addItem("skills", "")} label="Add Skill" />
          </Section>

          {/* Education */}
          <Section title="🎓 Education">
            <div className="space-y-4">
              {resume.education.map((edu, i) => (
                <div key={i} className="border border-slate-100 rounded-lg p-4 space-y-3 bg-slate-50/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" placeholder="Institution" value={edu.institution} onChange={(e) => updateArrayField("education", i, "institution", e.target.value)} className={inputClass} />
                    <input type="text" placeholder="Degree" value={edu.degree} onChange={(e) => updateArrayField("education", i, "degree", e.target.value)} className={inputClass} />
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="text" placeholder="Year (e.g. 2020–2024)" value={edu.year} onChange={(e) => updateArrayField("education", i, "year", e.target.value)} className={inputClass} />
                    <RemoveButton onClick={() => removeItem("education", i)} />
                  </div>
                </div>
              ))}
            </div>
            <AddButton onClick={() => addItem("education", { institution: "", degree: "", year: "" })} label="Add Education" />
          </Section>

          {/* Experience */}
          <Section title="💼 Experience">
            <div className="space-y-4">
              {resume.experience.map((exp, i) => (
                <div key={i} className="border border-slate-100 rounded-lg p-4 space-y-3 bg-slate-50/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" placeholder="Company" value={exp.company} onChange={(e) => updateArrayField("experience", i, "company", e.target.value)} className={inputClass} />
                    <input type="text" placeholder="Role" value={exp.role} onChange={(e) => updateArrayField("experience", i, "role", e.target.value)} className={inputClass} />
                  </div>
                  <input type="text" placeholder="Duration (e.g. Jan 2023 – Dec 2023)" value={exp.duration} onChange={(e) => updateArrayField("experience", i, "duration", e.target.value)} className={inputClass} />
                  <textarea placeholder="Description" value={exp.description} onChange={(e) => updateArrayField("experience", i, "description", e.target.value)} rows={2} className={`${inputClass} resize-none`} />
                  <RemoveButton onClick={() => removeItem("experience", i)} />
                </div>
              ))}
            </div>
            <AddButton onClick={() => addItem("experience", { company: "", role: "", duration: "", description: "" })} label="Add Experience" />
          </Section>

          {/* Projects */}
          <Section title="🚀 Projects">
            <div className="space-y-4">
              {resume.projects.map((proj, i) => (
                <div key={i} className="border border-slate-100 rounded-lg p-4 space-y-3 bg-slate-50/50">
                  <input type="text" placeholder="Project name" value={proj.name} onChange={(e) => updateArrayField("projects", i, "name", e.target.value)} className={inputClass} />
                  <textarea placeholder="Description" value={proj.description} onChange={(e) => updateArrayField("projects", i, "description", e.target.value)} rows={2} className={`${inputClass} resize-none`} />
                  <input type="text" placeholder="Link (optional)" value={proj.link} onChange={(e) => updateArrayField("projects", i, "link", e.target.value)} className={inputClass} />
                  <RemoveButton onClick={() => removeItem("projects", i)} />
                </div>
              ))}
            </div>
            <AddButton onClick={() => addItem("projects", { name: "", description: "", link: "" })} label="Add Project" />
          </Section>

          {/* Certifications */}
          <Section title="🏆 Certifications">
            <div className="space-y-3">
              {resume.certifications.map((cert, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Certification name"
                    value={cert}
                    onChange={(e) => {
                      const updated = [...resume.certifications];
                      updated[i] = e.target.value;
                      updateField("certifications", updated);
                    }}
                    className={inputClass}
                  />
                  <RemoveButton onClick={() => removeItem("certifications", i)} />
                </div>
              ))}
            </div>
            <AddButton onClick={() => addItem("certifications", "")} label="Add Certification" />
          </Section>

          <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 text-base">
            {isLoading ? "Saving..." : "Save Resume"}
          </button>
        </form>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm px-4 py-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Resume Preview</h2>
                <p className="text-sm text-slate-200 mt-1">Review layout before downloading or submitting.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <ResumePreview user={user} resume={resume} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeBuilder;
