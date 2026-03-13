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
      // no resume yet, use default empty state
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await saveResume(resume, token);
      setMessage("Resume saved successfully ✅");
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

  return (
    <div>
      <h1>Resume Builder</h1>
      {message && <p>{message}</p>}

      <form onSubmit={handleSave}>
        {/* Objective */}
        <section>
          <h2>Objective</h2>
          <textarea
            placeholder="Write a short objective"
            value={resume.objective}
            onChange={(e) => updateField("objective", e.target.value)}
            rows={3}
          />
        </section>

        {/* Skills */}
        <section>
          <h2>Skills</h2>
          {resume.skills.map((skill, i) => (
            <div key={i}>
              <input
                type="text"
                placeholder="Skill"
                value={skill}
                onChange={(e) => {
                  const updated = [...resume.skills];
                  updated[i] = e.target.value;
                  updateField("skills", updated);
                }}
              />
              <button type="button" onClick={() => removeItem("skills", i)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addItem("skills", "")}>
            + Add Skill
          </button>
        </section>

        {/* Education */}
        <section>
          <h2>Education</h2>
          {resume.education.map((edu, i) => (
            <div key={i}>
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
              />
              <input
                type="text"
                placeholder="Degree"
                value={edu.degree}
                onChange={(e) =>
                  updateArrayField("education", i, "degree", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Year"
                value={edu.year}
                onChange={(e) =>
                  updateArrayField("education", i, "year", e.target.value)
                }
              />
              <button type="button" onClick={() => removeItem("education", i)}>
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              addItem("education", { institution: "", degree: "", year: "" })
            }
          >
            + Add Education
          </button>
        </section>

        {/* Experience */}
        <section>
          <h2>Experience</h2>
          {resume.experience.map((exp, i) => (
            <div key={i}>
              <input
                type="text"
                placeholder="Company"
                value={exp.company}
                onChange={(e) =>
                  updateArrayField("experience", i, "company", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Role"
                value={exp.role}
                onChange={(e) =>
                  updateArrayField("experience", i, "role", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Duration (e.g. Jan 2023 - Dec 2023)"
                value={exp.duration}
                onChange={(e) =>
                  updateArrayField("experience", i, "duration", e.target.value)
                }
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
              />
              <button type="button" onClick={() => removeItem("experience", i)}>
                Remove
              </button>
            </div>
          ))}
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
          >
            + Add Experience
          </button>
        </section>

        {/* Projects */}
        <section>
          <h2>Projects</h2>
          {resume.projects.map((proj, i) => (
            <div key={i}>
              <input
                type="text"
                placeholder="Project name"
                value={proj.name}
                onChange={(e) =>
                  updateArrayField("projects", i, "name", e.target.value)
                }
              />
              <textarea
                placeholder="Description"
                value={proj.description}
                onChange={(e) =>
                  updateArrayField("projects", i, "description", e.target.value)
                }
                rows={2}
              />
              <input
                type="text"
                placeholder="Link (optional)"
                value={proj.link}
                onChange={(e) =>
                  updateArrayField("projects", i, "link", e.target.value)
                }
              />
              <button type="button" onClick={() => removeItem("projects", i)}>
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              addItem("projects", { name: "", description: "", link: "" })
            }
          >
            + Add Project
          </button>
        </section>

        {/* Certifications */}
        <section>
          <h2>Certifications</h2>
          {resume.certifications.map((cert, i) => (
            <div key={i}>
              <input
                type="text"
                placeholder="Certification"
                value={cert}
                onChange={(e) => {
                  const updated = [...resume.certifications];
                  updated[i] = e.target.value;
                  updateField("certifications", updated);
                }}
              />
              <button
                type="button"
                onClick={() => removeItem("certifications", i)}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addItem("certifications", "")}>
            + Add Certification
          </button>
        </section>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Resume"}
        </button>
      </form>
    </div>
  );
}

export default ResumeBuilder;
