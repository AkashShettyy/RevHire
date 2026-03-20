function hasContent(value) {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

function filledItems(items, predicate) {
  return (items || []).filter(predicate);
}

function ResumePreview({ user, resume }) {
  const education = filledItems(resume.education, (item) => hasContent(item.institution) || hasContent(item.degree) || hasContent(item.year));
  const experience = filledItems(resume.experience, (item) => hasContent(item.company) || hasContent(item.role) || hasContent(item.duration) || hasContent(item.description));
  const projects = filledItems(resume.projects, (item) => hasContent(item.name) || hasContent(item.description) || hasContent(item.link));
  const skills = filledItems(resume.skills, hasContent);
  const certifications = filledItems(resume.certifications, hasContent);

  const Section = ({ title, children }) => (
    <section className="border-t border-slate-200 pt-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{title}</h2>
      <div className="mt-3 space-y-3 text-sm text-slate-700">{children}</div>
    </section>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
      <header className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{user?.name || "Your Name"}</h1>
        <p className="mt-2 text-sm text-slate-500">{user?.email || "email@example.com"}</p>
      </header>

      {hasContent(resume.objective) && (
        <Section title="Professional Summary">
          <p className="leading-6 whitespace-pre-wrap">{resume.objective}</p>
        </Section>
      )}

      {skills.length > 0 && (
        <Section title="Skills">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                {skill}
              </span>
            ))}
          </div>
        </Section>
      )}

      {experience.length > 0 && (
        <Section title="Experience">
          {experience.map((item, index) => (
            <article key={`${item.company}-${item.role}-${index}`}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{item.role || "Role"}</h3>
                  <p className="text-slate-600">{item.company || "Company"}</p>
                </div>
                {hasContent(item.duration) && <p className="text-sm text-slate-500">{item.duration}</p>}
              </div>
              {hasContent(item.description) && <p className="mt-2 leading-6 whitespace-pre-wrap">{item.description}</p>}
            </article>
          ))}
        </Section>
      )}

      {education.length > 0 && (
        <Section title="Education">
          {education.map((item, index) => (
            <article key={`${item.institution}-${item.degree}-${index}`}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{item.degree || "Degree"}</h3>
                  <p className="text-slate-600">{item.institution || "Institution"}</p>
                </div>
                {hasContent(item.year) && <p className="text-sm text-slate-500">{item.year}</p>}
              </div>
            </article>
          ))}
        </Section>
      )}

      {projects.length > 0 && (
        <Section title="Projects">
          {projects.map((item, index) => (
            <article key={`${item.name}-${index}`}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <h3 className="font-semibold text-slate-900">{item.name || "Project"}</h3>
                {hasContent(item.link) && (
                  <a href={item.link} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-600 hover:underline break-all">
                    {item.link}
                  </a>
                )}
              </div>
              {hasContent(item.description) && <p className="mt-2 leading-6 whitespace-pre-wrap">{item.description}</p>}
            </article>
          ))}
        </Section>
      )}

      {certifications.length > 0 && (
        <Section title="Certifications">
          <ul className="space-y-2">
            {certifications.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

export default ResumePreview;
