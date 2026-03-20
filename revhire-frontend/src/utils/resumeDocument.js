function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function lineBreaks(value = "") {
  return escapeHtml(value).replaceAll("\n", "<br />");
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function section(title, content) {
  return content ? `<section><h2>${title}</h2>${content}</section>` : "";
}

export function buildResumeHtml(user, resume) {
  const skills = (resume.skills || []).filter(hasText);
  const certifications = (resume.certifications || []).filter(hasText);
  const education = (resume.education || []).filter((item) => [item.institution, item.degree, item.year].some(hasText));
  const experience = (resume.experience || []).filter((item) => [item.company, item.role, item.duration, item.description].some(hasText));
  const projects = (resume.projects || []).filter((item) => [item.name, item.description, item.link].some(hasText));

  const skillsHtml = skills.length
    ? `<div class="chips">${skills.map((skill) => `<span class="chip">${escapeHtml(skill)}</span>`).join("")}</div>`
    : "";

  const experienceHtml = experience.map((item) => `
    <article class="item">
      <div class="row">
        <div class="stack">
          <h3>${escapeHtml(item.role || "Role")}</h3>
          <p class="muted">${escapeHtml(item.company || "Company")}</p>
        </div>
        <p class="muted">${escapeHtml(item.duration || "")}</p>
      </div>
      ${hasText(item.description) ? `<p>${lineBreaks(item.description)}</p>` : ""}
    </article>
  `).join("");

  const educationHtml = education.map((item) => `
    <article class="item">
      <div class="row">
        <div class="stack">
          <h3>${escapeHtml(item.degree || "Degree")}</h3>
          <p class="muted">${escapeHtml(item.institution || "Institution")}</p>
        </div>
        <p class="muted">${escapeHtml(item.year || "")}</p>
      </div>
    </article>
  `).join("");

  const projectsHtml = projects.map((item) => `
    <article class="item">
      <div class="row">
        <h3>${escapeHtml(item.name || "Project")}</h3>
        ${hasText(item.link) ? `<a href="${escapeHtml(item.link)}">${escapeHtml(item.link)}</a>` : ""}
      </div>
      ${hasText(item.description) ? `<p>${lineBreaks(item.description)}</p>` : ""}
    </article>
  `).join("");

  const certificationsHtml = certifications.length
    ? `<ul>${certifications.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : "";

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(user?.name || "Resume")}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #0f172a; margin: 0; padding: 40px; }
          .page { max-width: 800px; margin: 0 auto; }
          h1 { font-size: 32px; margin: 0; }
          h2 { font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #475569; margin: 32px 0 12px; padding-top: 20px; border-top: 1px solid #cbd5e1; }
          h3 { font-size: 16px; margin: 0; }
          p { margin: 0; line-height: 1.6; }
          ul { margin: 0; padding-left: 20px; }
          li { margin-bottom: 8px; }
          .muted { color: #475569; }
          .row { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 12px; }
          .stack { display: flex; flex-direction: column; gap: 4px; }
          .chips { display: flex; flex-wrap: wrap; gap: 8px; }
          .chip { background: #e2e8f0; border-radius: 999px; padding: 6px 12px; font-size: 14px; }
          .item { margin-bottom: 16px; }
          a { color: #4f46e5; text-decoration: none; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="page">
          <header>
            <h1>${escapeHtml(user?.name || "Your Name")}</h1>
            <p class="muted">${escapeHtml(user?.email || "email@example.com")}</p>
          </header>

          ${hasText(resume.objective) ? section("Professional Summary", `<p>${lineBreaks(resume.objective)}</p>`) : ""}
          ${section("Skills", skillsHtml)}
          ${section("Experience", experienceHtml)}
          ${section("Education", educationHtml)}
          ${section("Projects", projectsHtml)}
          ${section("Certifications", certificationsHtml)}
        </div>
      </body>
    </html>
  `;
}

export function downloadResumePdf(user, resume) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    window.setTimeout(() => {
      iframe.remove();
    }, 1000);
  };
  iframe.srcdoc = buildResumeHtml(user, resume);
  document.body.appendChild(iframe);
}
