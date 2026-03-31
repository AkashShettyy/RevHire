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
    <div className="app-shell">
      <div className="absolute top-0 right-0 -mr-40 h-[600px] w-[600px] rounded-full bg-brand-300/20 blur-[120px] pointer-events-none"></div>
      
      <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="layout-container">
          <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 mb-6">
                <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-700">Hiring Platform</span>
              </span>
              <h1 className="heading-hero leading-[1.15]">
                Hiring tools that show exactly what this product can do.
              </h1>
              <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-surface-600">
                RevHire helps job seekers search and apply for roles, while employers can post jobs and review applicants. The landing page now reflects the real product.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link to="/register" className="btn-primary px-8 py-3.5 text-base shadow-brand-500/30">
                  Create an account
                </Link>
                <Link to="/login" className="btn-secondary px-8 py-3.5 text-base shadow-sm">
                  Sign in
                </Link>
              </div>
              <div className="mt-12 grid gap-5 sm:grid-cols-3">
                {[
                  { label: "Jobs", value: "Search & apply" },
                  { label: "Resumes", value: "Build & export" },
                  { label: "Hiring", value: "Post & review" },
                ].map((item, i) => (
                  <div key={item.label} className="premium-card bg-white/70 backdrop-blur-md px-5 py-5 border-surface-200/60 shadow-sm transition-transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-2">
                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${['bg-brand-500', 'bg-violet-500', 'bg-indigo-500'][i]}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"></path></svg>
                       </div>
                       <p className="text-[11px] font-bold uppercase tracking-widest text-surface-400">{item.label}</p>
                    </div>
                    <p className="text-sm font-bold text-surface-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 w-full lg:ml-auto">
              <div className="premium-card overflow-hidden border border-white bg-white/70 p-2 shadow-2xl shadow-surface-900/10 transition-transform duration-500 hover:rotate-0">
                <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-brand-50 via-white to-cyan-50 p-8 text-surface-900">
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-brand-100/40 to-transparent opacity-70 pointer-events-none"></div>
                  
                  <p className="text-[11px] font-bold uppercase tracking-widest text-brand-700">Current workflow</p>
                  <h2 className="mt-3 text-3xl font-bold font-display">What users can do today</h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-surface-600 font-medium">
                    The project already supports account creation, protected routes, job discovery, job posting, applicant review, and resume export.
                  </p>
                </div>
                <div className="mt-2 space-y-2 p-4">
                  {capabilityGroups.map((group) => (
                    <div key={group.title} className="rounded-2xl border border-surface-100 bg-white/80 p-5 shadow-sm">
                      <h3 className="text-[15px] font-bold text-surface-900 font-display">{group.title}</h3>
                      <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-surface-600">
                        {group.items.map((item) => (
                          <li key={item} className="flex items-start gap-3">
                            <span className="mt-1 flex shrink-0 h-1.5 w-1.5 rounded-full bg-brand-500" />
                            <span className="font-medium">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 bg-surface-50/50 border-y border-surface-200/50">
        <div className="layout-container">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-flex rounded-full bg-surface-200/50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-surface-600">Product Overview</span>
            <h2 className="heading-section mt-6">A clearer interface around the real features</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-surface-600 font-medium">
              These sections describe existing flows in the project. Nothing here depends on unverified claims.
            </p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {productNotes.map((item, i) => (
              <article key={item.title} className="premium-card p-8 bg-white hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-6">
                  <span className="font-display text-xl font-bold">0{i+1}</span>
                </div>
                <h3 className="text-lg font-bold text-surface-900 font-display">{item.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-surface-600 font-medium">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="layout-container">
          <div className="relative overflow-hidden rounded-[32px] border border-brand-100 bg-gradient-to-br from-white via-brand-50 to-cyan-50 px-6 py-16 text-center text-surface-900 shadow-2xl shadow-brand-100/60 sm:px-12">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full border border-brand-100 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full border border-cyan-100 pointer-events-none"></div>

            <p className="relative z-10 text-[11px] font-bold uppercase tracking-widest text-brand-700">Start with the real workflow</p>
            <h2 className="relative z-10 heading-section mt-5 max-w-2xl mx-auto leading-tight">Use the job seeker or employer flow that fits your role.</h2>
            <p className="relative z-10 mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-surface-600 font-medium">
              Create an account to explore the current product experience, or sign in if you already have one.
            </p>
            <div className="relative z-10 mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/register" className="btn-primary px-8 py-3.5 shadow-brand-200/60">
                Get started
              </Link>
              <Link to="/login" className="btn-secondary px-8 py-3.5">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-surface-200/80 py-10 text-center text-sm font-medium text-surface-500 bg-white">
        © {new Date().getFullYear()} RevHire Platform
      </footer>
    </div>
  );
}

export default Landing;
