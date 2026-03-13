import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getResume, saveResume } from "../services/resumeService";

function ResumeBuilder() {
  const { token } = useAuth();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [resume, setResume] = useState({
    objective: "",
    education: [{ institution: "", degree: "", year: "" }],
    experience: [{ company: "", role: "", duration: "", description: "" }],
    skills: [""],
    projects: [{ name: "", description: "", link: "" }],
    certifications: [""],
  });

  useEffect(() => {
    fetchResume();
  }, []);

  async function fetchResume() {
    try {
      const data = await getResume(token);
      setResume(data.resume);
    } catch (error) {
      // no resume yet
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await saveResume(resume, token);
      setMessage("Resume saved successfully ✅");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  function updateField(field, value) {
    setResume({ ...resume, [field]: value });
  }

  function updateArrayField(field, index, key, value) {
    const updated = [...resume[field]];
    updated[index] = { ...updated[index], [key]: value };
    setResume({ ...resume, [field]: updated });
  }

  function addItem(field, emptyItem) {
    setResume({ ...resume, [field]: [...resume[field], emptyItem] });
  }

  function removeItem(field, index) {
    const updated = resume[field].filter((_, i) => i !== index);
    setResume({ ...resume, [field]: updated });
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm";
  const sectionClass =
    "bg-white rounded-xl p-6 shadow-sm border border-gray-100";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
          {message && (
            <p className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm">
              {message}
            </p>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Objective */}
          <div className={sectionClass}>
            <h2 className="font-semibold text-gray-900 mb-4">🎯 Objective</h2>
            <textarea
              placeholder="Write a short professional objective..."
              value={resume.objective}
              onChange={(e) => updateField("objective", e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Skills */}
          <div className={sectionClass}>
            <h2 className="font-semibold text-gray-900 mb-4">⚡ Skills</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {resume.skills.map((skill, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 bg-blue-50 rounded-lg px-3 py-1.5"
                >
                  <input
                    type="text"
                    placeholder="Skill"
                    value={skill}
                    onChange={(e) => {
                      const updated = [...resume.skills];
                      updated[i] = e.target.value;
                      updateField("skills", updated);
                    }}
                    className="bg-transparent outline-none text-sm text-blue-700 w-24"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem("skills", i)}
                    className="text-blue-400 hover:text-red-500 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addItem("skills", "")}
              className="text-primary text-sm hover:underline"
            >
              + Add Skill
            </button>
          </div>

          {/* Education */}
          <div className={sectionClass}>
            <h2 className="font-semibold text-gray-900 mb-4">🎓 Education</h2>
            <div className="space-y-4">
              {resume.education.map((edu, i) => (
                <div
                  key={i}
                  className="border border-gray-100 rounded-lg p-4 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Institution"
                      value={edu.institution}
                      onChange={(e) =>
                        updateArrayField(
                          "education",
                          i,
                          "institution",
                          e.target.value,
                        )
                      }
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) =>
                        updateArrayField(
                          "education",
                          i,
                          "degree",
                          e.target.value,
                        )
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Year (e.g. 2020-2024)"
                      value={edu.year}
                      onChange={(e) =>
                        updateArrayField("education", i, "year", e.target.value)
                      }
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem("education", i)}
                      className="text-red-400 hover:text-red-600 text-sm whitespace-nowrap"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                addItem("education", { institution: "", degree: "", year: "" })
              }
              className="mt-3 text-primary text-sm hover:underline"
            >
              + Add Education
            </button>
          </div>

          {/* Experience */}
          <div className={sectionClass}>
            <h2 className="font-semibold text-gray-900 mb-4">💼 Experience</h2>
            <div className="space-y-4">
              {resume.experience.map((exp, i) => (
                <div
                  key={i}
                  className="border border-gray-100 rounded-lg p-4 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) =>
                        updateArrayField(
                          "experience",
                          i,
                          "company",
                          e.target.value,
                        )
                      }
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="Role"
                      value={exp.role}
                      onChange={(e) =>
                        updateArrayField(
                          "experience",
                          i,
                          "role",
                          e.target.value,
                        )
                      }
                      className={inputClass}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Duration (e.g. Jan 2023 - Dec 2023)"
                    value={exp.duration}
                    onChange={(e) =>
                      updateArrayField(
                        "experience",
                        i,
                        "duration",
                        e.target.value,
                      )
                    }
                    className={inputClass}
                  />
                  <textarea
                    placeholder="Description"
                    value={exp.description}
                    onChange={(e) =>
                      updateArrayField(
                        "experience",
                        i,
                        "description",
                        e.target.value,
                      )
                    }
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem("experience", i)}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                addItem("experience", {
                  company: "",
                  role: "",
                  duration: "",
                  description: "",
                })
              }
              className="mt-3 text-primary text-sm hover:underline"
            >
              + Add Experience
            </button>
          </div>

          {/* Projects */}
          <div className={sectionClass}>
            <h2 className="font-semibold text-gray-900 mb-4">🚀 Projects</h2>
            <div className="space-y-4">
              {resume.projects.map((proj, i) => (
                <div
                  key={i}
                  className="border border-gray-100 rounded-lg p-4 space-y-3"
                >
                  <input
                    type="text"
                    placeholder="Project name"
                    value={proj.name}
                    onChange={(e) =>
                      updateArrayField("projects", i, "name", e.target.value)
                    }
                    className={inputClass}
                  />
                  <textarea
                    placeholder="Description"
                    value={proj.description}
                    onChange={(e) =>
                      updateArrayField(
                        "projects",
                        i,
                        "description",
                        e.target.value,
                      )
                    }
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                  <input
                    type="text"
                    placeholder="Link (optional)"
                    value={proj.link}
                    onChange={(e) =>
                      updateArrayField("projects", i, "link", e.target.value)
                    }
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem("projects", i)}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                addItem("projects", { name: "", description: "", link: "" })
              }
              className="mt-3 text-primary text-sm hover:underline"
            >
              + Add Project
            </button>
          </div>

          {/* Certifications */}
          <div className={sectionClass}>
            <h2 className="font-semibold text-gray-900 mb-4">
              🏆 Certifications
            </h2>
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
                  <button
                    type="button"
                    onClick={() => removeItem("certifications", i)}
                    className="text-red-400 hover:text-red-600 text-sm whitespace-nowrap"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addItem("certifications", "")}
              className="mt-3 text-primary text-sm hover:underline"
            >
              + Add Certification
            </button>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-secondary transition-colors disabled:opacity-50 text-lg"
          >
            {isLoading ? "Saving..." : "Save Resume"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResumeBuilder;
