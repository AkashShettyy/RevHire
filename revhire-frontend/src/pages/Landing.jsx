import { Link } from "react-router-dom";

const capabilityGroups = [
  {
    title: "For job seekers",
    items: ["Search openings by title, location, and job type", "Track submitted applications in one place", "Build a resume and export it as PDF"],
  },
  {
    title: "For employers",
    items: ["Post new roles with structured requirements", "Review applicants and their cover letters", "Shortlist, reject, close, or reopen positions"],
  },
];

const productNotes = [
  {
    title: "Single workspace",
    desc: "The product brings job discovery, resume building, application history, and hiring workflows into one interface.",
  },
  {
    title: "Role-based experience",
    desc: "Job seekers and employers each get their own dashboards, actions, and navigation.",
  },
  {
    title: "Practical flows",
    desc: "Every screen is focused on the actions already available in this project instead of placeholder marketing promises.",
  },
];

function Landing() {
  return (
    <div className="app-page">
      <section className="app-hero">
        <div className="app-shell py-16 sm:py-20">
          <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <span className="app-eyebrow">Hiring platform for two sides of the workflow</span>
              <h1 className="app-heading mt-6 max-w-3xl">
                Hiring tools that show exactly what this product can do.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600">
                RevHire helps job seekers search and apply for roles, while employers can post jobs and review applicants. The landing page now reflects the real product instead of inflated usage claims.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link to="/register" className="app-button px-7">
                  Create an account
                </Link>
                <Link to="/login" className="app-button-secondary px-7">
                  Sign in
                </Link>
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Jobs", value: "Search, filter, apply" },
                  { label: "Resumes", value: "Build, preview, export" },
                  { label: "Hiring", value: "Post, review, update" },
                ].map((item) => (
                  <div key={item.label} className="app-panel px-5 py-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">{item.label}</p>
                    <p className="mt-3 text-lg font-semibold text-stone-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="app-panel overflow-hidden p-6 sm:p-7">
              <div className="rounded-[24px] bg-gradient-to-br from-blue-700 to-blue-900 px-5 py-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/85">Current workflow</p>
                <h2 className="mt-3 text-2xl font-bold">What users can do today</h2>
                <p className="mt-2 text-sm leading-6 text-stone-300">
                  The project already supports account creation, protected routes, job discovery, job posting, applicant review, notifications, and resume export.
                </p>
              </div>
              <div className="mt-5 space-y-4">
                {capabilityGroups.map((group) => (
                  <div key={group.title} className="app-soft-panel px-5 py-5">
                    <h3 className="text-base font-semibold text-stone-900">{group.title}</h3>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-600">
                      {group.items.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="app-shell py-16">
        <div className="max-w-2xl">
          <span className="app-eyebrow">Product overview</span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">A clearer interface around the real features</h2>
          <p className="mt-4 text-base leading-7 text-stone-600">
            These sections describe existing flows in the project. Nothing here depends on unverified customer counts, fake adoption numbers, or unsupported feature claims.
          </p>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {productNotes.map((item) => (
            <article key={item.title} className="app-panel p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">{item.title}</p>
              <p className="mt-4 text-sm leading-7 text-stone-600">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="app-shell pb-16">
        <div className="rounded-[32px] bg-gradient-to-br from-blue-700 to-blue-900 px-6 py-10 text-center text-white shadow-2xl shadow-blue-900/20 sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-100/85">Start with the real workflow</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Use the job seeker or employer flow that fits your role.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-stone-300 sm:text-base">
            Create an account to explore the current product experience, or sign in if you already have one.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/register" className="app-button bg-none">
              Get started
            </Link>
            <Link to="/login" className="app-button-secondary border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200/80 py-8 text-center text-sm text-stone-500">
        © {new Date().getFullYear()} RevHire
      </footer>
    </div>
  );
}

export default Landing;
