import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getResume, saveResume, deleteResume } from "../services/resumeService";
import ResumePreview from "../components/ResumePreview";
import { downloadResumePdf } from "../utils/resumeDocument";

const inputClass = "app-input";
const emptyResume = {
  title: "Primary Resume",
  objective: "",
  education: [{ institution: "", degree: "", year: "" }],
  experience: [{ company: "", role: "", duration: "", description: "" }],
  skills: [""],
  projects: [{ name: "", description: "", link: "" }],
  certifications: [""],
  uploadedFile: {
    fileName: "",
    mimeType: "",
    size: 0,
    dataUrl: "",
  },
};

function Section({ title, children }) {
  return (
    <div className="app-panel p-6 sm:p-8">
      <h2 className="mb-5 font-semibold text-stone-900">{title}</h2>
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
  const [resumes, setResumes] = useState([]);
  const [activeResumeId, setActiveResumeId] = useState("");
  const [resume, setResume] = useState(emptyResume);

  const fetchResume = useCallback(async () => {
    try {
      const data = await getResume(token);
      setResumes(data.resumes || []);
      setResume(data.resume || emptyResume);
      setActiveResumeId(data.resume?._id || "");
    } catch {
      setResume(emptyResume);
      setResumes([]);
      setActiveResumeId("");
    }
  }, [token]);

  useEffect(() => { fetchResume(); }, [fetchResume]);

  async function handleSave(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await saveResume(
        {
          ...resume,
          resumeId: activeResumeId || undefined,
          setAsDefault: true,
        },
        token,
      );
      setResumes(data.resumes || []);
      setResume(data.resume || resume);
      setActiveResumeId(data.resume?._id || activeResumeId);
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

  function handleCreateVersion() {
    setActiveResumeId("");
    setResume({
      ...emptyResume,
      title: `Resume Version ${resumes.length + 1}`,
    });
  }

  function handleSwitchVersion(resumeId) {
    const selectedResume = resumes.find((entry) => entry._id === resumeId);
    if (!selectedResume) return;
    setActiveResumeId(resumeId);
    setResume(selectedResume);
  }

  async function handleDeleteResume() {
    if (!activeResumeId) return;
    try {
      const data = await deleteResume(activeResumeId, token);
      const nextResume = data.resumes?.[0] || emptyResume;
      setResumes(data.resumes || []);
      setResume(nextResume);
      setActiveResumeId(nextResume._id || "");
      setMessage("saved");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("error");
    }
  }

  function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setMessage("error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setResume((current) => ({
        ...current,
        uploadedFile: {
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          dataUrl: typeof reader.result === "string" ? reader.result : "",
        },
      }));
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="app-page">
      <div className="app-hero">
        <div className="app-shell max-w-3xl py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="app-eyebrow">Resume workspace</span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-950">Resume Builder</h1>
              <p className="mt-2 text-sm text-stone-500">Manage multiple resume versions, upload a PDF copy, and export the current draft.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={handleCreateVersion} className="app-button-secondary px-4 py-2">
                New Version
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="app-button-secondary px-4 py-2"
              >
                Preview Resume
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="app-button px-4 py-2"
              >
                {isDownloading ? "Preparing PDF..." : "Download PDF"}
              </button>
            </div>
            {message === "saved" && (
              <div className="app-message-success">Saved successfully</div>
            )}
            {message === "error" && (
              <div className="app-message-error">
                Something went wrong
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="app-shell max-w-3xl py-8">
        <form onSubmit={handleSave} onKeyDown={handleFormKeyDown} className="space-y-6">
          <Section title="Resume Version">
            <div className="grid gap-4 sm:grid-cols-[1fr,auto]">
              <div>
                <label className="app-label">Version Name</label>
                <input
                  type="text"
                  value={resume.title || ""}
                  onChange={(event) => updateField("title", event.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="sm:pt-8">
                <select
                  value={activeResumeId}
                  onChange={(event) => handleSwitchVersion(event.target.value)}
                  className={inputClass}
                >
                  <option value="">Unsaved Version</option>
                  {resumes.map((entry) => (
                    <option key={entry._id} value={entry._id}>
                      {entry.title}{entry.isDefault ? " (Default)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="app-label">Upload Resume File</label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className={inputClass} />
                {resume.uploadedFile?.fileName && (
                  <p className="mt-2 text-sm text-stone-500">
                    Attached: {resume.uploadedFile.fileName}
                  </p>
                )}
              </div>
              {activeResumeId && (
                <div className="sm:pt-8">
                  <button type="button" onClick={handleDeleteResume} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100">
                    Delete This Version
                  </button>
                </div>
              )}
            </div>
          </Section>

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
                <div key={i} className="flex items-center gap-1.5 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-1.5">
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
                <div key={i} className="space-y-3 rounded-2xl border border-stone-200 bg-white/55 p-4">
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
                <div key={i} className="space-y-3 rounded-2xl border border-stone-200 bg-white/55 p-4">
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
                <div key={i} className="space-y-3 rounded-2xl border border-stone-200 bg-white/55 p-4">
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

          <button type="submit" disabled={isLoading} className="app-button w-full py-3.5 text-base">
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
