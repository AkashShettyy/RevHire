function hasContent(value) {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

function filledItems(items, predicate) {
  return (items || []).filter(predicate);
}

function ResumeSection({ title, children }) {
  return (
    <section className="border-t border-slate-200 pt-5">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">{children}</div>
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
    <div className="mx-auto min-h-[calc(100vh-12rem)] max-w-[860px] bg-white px-10 py-12 text-slate-800 shadow-[0_24px_80px_rgba(15,23,42,0.12)] sm:px-14">
      <header className="border-b-2 border-slate-900 pb-8">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-slate-950">{user?.name || "Your Name"}</h1>
        <p className="mt-3 text-sm font-medium text-slate-600">{user?.email || "email@example.com"}</p>
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
              <span key={skill} className="rounded-sm border border-slate-300 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">
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
                  <h3 className="font-semibold text-slate-900">{item.role || "Role"}</h3>
                  <p className="text-slate-700">{item.company || "Company"}</p>
                </div>
                {hasContent(item.duration) && <p className="text-sm font-medium text-slate-500">{item.duration}</p>}
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
                  <h3 className="font-semibold text-slate-900">{item.degree || "Degree"}</h3>
                  <p className="text-slate-700">{item.institution || "Institution"}</p>
                </div>
                {hasContent(item.year) && <p className="text-sm font-medium text-slate-500">{item.year}</p>}
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
                <h3 className="font-semibold text-slate-900">{item.name || "Project"}</h3>
                {hasContent(item.link) && (
                  <a href={item.link} target="_blank" rel="noreferrer" className="break-all text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-900">
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
