function hasContent(value) {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

function filledItems(items, predicate) {
  return (items || []).filter(predicate);
}

function ResumeSection({ title, children }) {
  return (
    <section className="border-t border-stone-200 pt-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">{title}</h2>
      <div className="mt-3 space-y-3 text-sm text-stone-700">{children}</div>
    </section>
  );
}

function ResumePreview({ user, resume }) {
  const education = filledItems(resume.education, (item) => hasContent(item.institution) || hasContent(item.degree) || hasContent(item.year));
  const experience = filledItems(resume.experience, (item) => hasContent(item.company) || hasContent(item.role) || hasContent(item.duration) || hasContent(item.description));
  const projects = filledItems(resume.projects, (item) => hasContent(item.name) || hasContent(item.description) || hasContent(item.link));
  const skills = filledItems(resume.skills, hasContent);
  const certifications = filledItems(resume.certifications, hasContent);

  return (
    <div className="space-y-6 rounded-[30px] border border-blue-100 bg-white p-8 shadow-sm">
      <header className="border-b border-stone-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">{user?.name || "Your Name"}</h1>
        <p className="mt-2 text-sm text-stone-500">{user?.email || "email@example.com"}</p>
      </header>

      {hasContent(resume.objective) && (
        <ResumeSection title="Professional Summary">
          <p className="leading-6 whitespace-pre-wrap">{resume.objective}</p>
        </ResumeSection>
      )}

      {skills.length > 0 && (
        <ResumeSection title="Skills">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill} className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                {skill}
              </span>
            ))}
          </div>
        </ResumeSection>
      )}

      {experience.length > 0 && (
        <ResumeSection title="Experience">
          {experience.map((item, index) => (
            <article key={`${item.company}-${item.role}-${index}`}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-semibold text-stone-900">{item.role || "Role"}</h3>
                  <p className="text-stone-600">{item.company || "Company"}</p>
                </div>
                {hasContent(item.duration) && <p className="text-sm text-stone-500">{item.duration}</p>}
              </div>
              {hasContent(item.description) && <p className="mt-2 leading-6 whitespace-pre-wrap">{item.description}</p>}
            </article>
          ))}
        </ResumeSection>
      )}

      {education.length > 0 && (
        <ResumeSection title="Education">
          {education.map((item, index) => (
            <article key={`${item.institution}-${item.degree}-${index}`}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-semibold text-stone-900">{item.degree || "Degree"}</h3>
                  <p className="text-stone-600">{item.institution || "Institution"}</p>
                </div>
                {hasContent(item.year) && <p className="text-sm text-stone-500">{item.year}</p>}
              </div>
            </article>
          ))}
        </ResumeSection>
      )}

      {projects.length > 0 && (
        <ResumeSection title="Projects">
          {projects.map((item, index) => (
            <article key={`${item.name}-${index}`}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <h3 className="font-semibold text-stone-900">{item.name || "Project"}</h3>
                {hasContent(item.link) && (
                  <a href={item.link} target="_blank" rel="noreferrer" className="break-all text-sm font-medium text-blue-700 hover:underline">
                    {item.link}
                  </a>
                )}
              </div>
              {hasContent(item.description) && <p className="mt-2 leading-6 whitespace-pre-wrap">{item.description}</p>}
            </article>
          ))}
        </ResumeSection>
      )}

      {certifications.length > 0 && (
        <ResumeSection title="Certifications">
          <ul className="space-y-2">
            {certifications.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </ResumeSection>
      )}
    </div>
  );
}

export default ResumePreview;
