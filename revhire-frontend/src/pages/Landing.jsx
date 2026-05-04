import { Link } from "react-router-dom";

const highlights = [
  { label: "Job seekers", text: "Search jobs, save roles, apply, and manage resumes." },
  { label: "Employers", text: "Post openings, review applicants, and schedule interviews." },
  { label: "Workflows", text: "Role-based dashboards keep the product focused after login." },
];

function Landing() {
  return (
    <div className="app-shell">
      <section className="relative py-12 sm:py-16 lg:py-20">
        <div className="layout-container">
          <div className="page-hero grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="eyebrow">Hiring Platform</span>
              <h1 className="heading-hero mt-6 leading-[1.08]">
                RevHire
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-7 text-surface-700">
                A clean hiring workspace for candidates and employers to manage jobs, applications, resumes, and interviews.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/register" className="btn-primary px-8 py-3.5 text-base">
                  Create an account
                </Link>
                <Link to="/login" className="btn-secondary px-8 py-3.5 text-base">
                  Sign in
                </Link>
              </div>
            </div>

            <div className="glass-panel p-5">
              <div className="rounded-lg bg-gradient-to-br from-surface-950 via-brand-900 to-brand-700 p-7 text-white">
                <p className="text-xs font-semibold uppercase tracking-normal text-brand-100">One product surface</p>
                <h2 className="mt-3 font-display text-2xl font-bold">Built around real hiring tasks.</h2>
                <div className="mt-6 grid gap-3">
                  {highlights.map((item) => (
                    <div key={item.label} className="rounded-lg border border-white/10 bg-white/10 p-4">
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="mt-1 text-sm leading-6 text-white/75">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-brand-100 bg-white/70 py-14">
        <div className="layout-container">
          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <article key={item.label} className="premium-card p-6">
                <h3 className="font-display text-lg font-bold text-surface-900">{item.label}</h3>
                <p className="mt-2 text-sm leading-6 text-surface-700">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-brand-100 bg-white/75 py-8 text-center text-sm font-medium text-surface-500">
        © {new Date().getFullYear()} RevHire Platform
      </footer>
    </div>
  );
}

export default Landing;
