import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getResume, saveResume, deleteResume } from "../services/resumeService";
import ResumePreview from "../components/ResumePreview";
import { downloadResumePdf } from "../utils/resumeDocument";

const inputClass = "input-field";
const createEmptyResume = () => ({
  title: "",
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
});

function Section({ title, children }) {
  return (
    <div className="premium-card bg-white p-6 sm:p-8 shadow-sm">
      <h2 className="font-display mb-6 text-xl font-bold text-surface-900">{title}</h2>
      {children}
    </div>
  );
}

function AddButton({ onClick, label }) {
  return (
    <button type="button" onClick={onClick} className="mt-5 flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors">
      <span className="text-lg leading-none">+</span> {label}
    </button>
  );
}

function RemoveButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="text-[13px] font-bold text-error-500 transition-colors hover:text-error-600 bg-error-50 px-3 py-1.5 rounded-lg hover:bg-error-100">
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
  const [resume, setResume] = useState(() => createEmptyResume());

  const fetchResume = useCallback(async () => {
    try {
      const data = await getResume(token);
      setResumes(data.resumes || []);
      setResume(data.resume || createEmptyResume());
      setActiveResumeId(data.resume?._id || "");
    } catch {
      setResume(createEmptyResume());
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
    setResume(createEmptyResume());
  }

  function handleSwitchVersion(resumeId) {
    if (!resumeId) {
      setActiveResumeId("");
      setResume(createEmptyResume());
      return;
    }
    const selectedResume = resumes.find((entry) => entry._id === resumeId);
    if (!selectedResume) return;
    setActiveResumeId(resumeId);
    setResume(selectedResume);
  }

  async function handleDeleteResume() {
    if (!activeResumeId) return;
    try {
      const data = await deleteResume(activeResumeId, token);
      const nextResume = data.resumes?.[0] || createEmptyResume();
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
    <div className="app-shell">
      <div className="absolute top-0 right-0 -mr-40 h-[600px] w-[600px] rounded-full bg-brand-300/20 blur-[100px] pointer-events-none"></div>

      <div className="pt-10 pb-10 border-b border-surface-200/60 bg-white/50 backdrop-blur-md relative z-10">
        <div className="layout-container max-w-4xl">
          <div className="page-hero flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow mb-4">
                Resume Workspace
              </span>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-surface-900 sm:text-4xl">Resume Builder</h1>
              <p className="mt-3 max-w-2xl text-[17px] font-medium text-surface-700">
                Manage multiple resume versions, upload a PDF copy, and export the current draft.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={handleCreateVersion} className="btn-secondary">
                New Version
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="btn-secondary"
              >
                Preview Resume
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="btn-primary flex-1 sm:flex-none justify-center"
              >
                {isDownloading ? "Preparing PDF..." : "Download PDF"}
              </button>
            </div>
          </div>
          <div className="mt-6 flex gap-4 min-h-[40px]">
             {message === "saved" && (
               <div className="rounded-xl border border-success-200 bg-success-50 px-4 py-2 font-semibold text-success-800 shadow-sm animate-fade-in inline-block">Saved successfully</div>
             )}
             {message === "error" && (
               <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-2 font-semibold text-error-800 shadow-sm animate-fade-in inline-block">Something went wrong</div>
             )}
          </div>
        </div>
      </div>

      <div className="layout-container max-w-4xl py-10 relative z-10">
        <form onSubmit={handleSave} onKeyDown={handleFormKeyDown} className="space-y-8">
          <Section title="Resume Version">
            <div className="grid gap-5 sm:grid-cols-[1fr,auto]">
              <div>
                <label className="mb-2 block text-[13px] font-bold uppercase tracking-widest text-surface-700">Version Name</label>
                <input
                  type="text"
                  value={resume.title || ""}
                  onChange={(event) => updateField("title", event.target.value)}
                  placeholder={activeResumeId ? "Resume title" : `Resume Version ${resumes.length + 1}`}
                  className={inputClass}
                />
              </div>
              <div className="sm:pt-7">
                <select
                  value={activeResumeId}
                  onChange={(event) => handleSwitchVersion(event.target.value)}
                  className={inputClass}
                >
                  <option value="">New Draft</option>
                  {resumes.map((entry) => (
                    <option key={entry._id} value={entry._id}>
                      {entry.title}{entry.isDefault ? " (Default)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[13px] font-bold uppercase tracking-widest text-surface-700">Upload Resume File</label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className={`${inputClass} !py-2`} />
                {resume.uploadedFile?.fileName && (
                  <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-surface-300 bg-surface-100 px-3 py-1.5 text-[13px] font-medium text-surface-700">
                    <span className="text-lg">📎</span> {resume.uploadedFile.fileName}
                  </p>
                )}
              </div>
              {activeResumeId && (
                <div className="sm:pt-8 flex items-start">
                  <button type="button" onClick={handleDeleteResume} className="rounded-xl border border-error-200 bg-error-50 px-5 py-3 text-[14px] font-bold text-error-600 transition-colors hover:bg-error-100 w-full sm:w-auto mt-0.5">
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
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </Section>

          {/* Skills */}
          <Section title="⚡ Skills">
            <div className="flex flex-wrap gap-3 mb-4">
              {resume.skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-1">
                  <input
                    type="text"
                    placeholder="Skill"
                    value={skill}
                    onChange={(e) => {
                      const updated = [...resume.skills];
                      updated[i] = e.target.value;
                      updateField("skills", updated);
                    }}
                    className="w-28 bg-transparent text-[14px] font-bold text-brand-700 outline-none placeholder-brand-300"
                  />
                  <button type="button" onClick={() => removeItem("skills", i)} className="text-sm font-bold text-brand-400 transition-colors hover:text-error-500 p-1 rounded-md hover:bg-white/50">✕</button>
                </div>
              ))}
            </div>
            <AddButton onClick={() => addItem("skills", "")} label="Add Skill" />
          </Section>

          {/* Education */}
          <Section title="🎓 Education">
            <div className="space-y-5">
              {resume.education.map((edu, i) => (
                <div key={i} className="space-y-4 rounded-xl border border-surface-200 bg-surface-50 p-5 transition-colors focus-within:bg-white focus-within:border-brand-200 focus-within:shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="Institution" value={edu.institution} onChange={(e) => updateArrayField("education", i, "institution", e.target.value)} className={inputClass} />
                    <input type="text" placeholder="Degree" value={edu.degree} onChange={(e) => updateArrayField("education", i, "degree", e.target.value)} className={inputClass} />
                  </div>
                  <div className="flex items-center gap-4">
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
            <div className="space-y-5">
              {resume.experience.map((exp, i) => (
                <div key={i} className="space-y-4 rounded-xl border border-surface-200 bg-surface-50 p-5 transition-colors focus-within:bg-white focus-within:border-brand-200 focus-within:shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="Company" value={exp.company} onChange={(e) => updateArrayField("experience", i, "company", e.target.value)} className={inputClass} />
                    <input type="text" placeholder="Role" value={exp.role} onChange={(e) => updateArrayField("experience", i, "role", e.target.value)} className={inputClass} />
                  </div>
                  <input type="text" placeholder="Duration (e.g. Jan 2023 – Dec 2023)" value={exp.duration} onChange={(e) => updateArrayField("experience", i, "duration", e.target.value)} className={inputClass} />
                  <textarea placeholder="Description" value={exp.description} onChange={(e) => updateArrayField("experience", i, "description", e.target.value)} rows={3} className={`${inputClass} resize-none`} />
                  <div className="flex justify-end">
                    <RemoveButton onClick={() => removeItem("experience", i)} />
                  </div>
                </div>
              ))}
            </div>
            <AddButton onClick={() => addItem("experience", { company: "", role: "", duration: "", description: "" })} label="Add Experience" />
          </Section>

          {/* Projects */}
          <Section title="🚀 Projects">
            <div className="space-y-5">
              {resume.projects.map((proj, i) => (
                <div key={i} className="space-y-4 rounded-xl border border-surface-200 bg-surface-50 p-5 transition-colors focus-within:bg-white focus-within:border-brand-200 focus-within:shadow-sm">
                  <input type="text" placeholder="Project name" value={proj.name} onChange={(e) => updateArrayField("projects", i, "name", e.target.value)} className={inputClass} />
                  <textarea placeholder="Description" value={proj.description} onChange={(e) => updateArrayField("projects", i, "description", e.target.value)} rows={3} className={`${inputClass} resize-none`} />
                  <div className="flex items-center gap-4">
                     <input type="text" placeholder="Link (optional)" value={proj.link} onChange={(e) => updateArrayField("projects", i, "link", e.target.value)} className={inputClass} />
                     <RemoveButton onClick={() => removeItem("projects", i)} />
                  </div>
                </div>
              ))}
            </div>
            <AddButton onClick={() => addItem("projects", { name: "", description: "", link: "" })} label="Add Project" />
          </Section>

          {/* Certifications */}
          <Section title="🏆 Certifications">
            <div className="space-y-4">
              {resume.certifications.map((cert, i) => (
                <div key={i} className="flex items-center gap-4">
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

          <button type="submit" disabled={isLoading} className="btn-primary w-full py-4 text-lg">
            {isLoading ? "Saving..." : "Save Resume"}
          </button>
        </form>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 bg-surface-900/60 backdrop-blur-md px-4 py-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6 bg-white rounded-2xl p-4 shadow-lg border border-surface-200">
              <div className="px-2">
                <h2 className="text-xl font-bold text-surface-900 font-['Outfit']">Resume Preview</h2>
                <p className="text-[14px] font-medium text-surface-500 mt-0.5">Review layout before downloading or submitting.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="btn-secondary"
              >
                Close Preview
              </button>
            </div>
            <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
              <ResumePreview user={user} resume={resume} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeBuilder;
