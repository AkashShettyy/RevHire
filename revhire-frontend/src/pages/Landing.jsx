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
      <div className="pointer-events-none absolute right-[-7rem] top-[-1rem] h-[34rem] w-[34rem] rounded-full bg-brand-300/25 blur-[120px]"></div>
      <div className="pointer-events-none absolute left-[-6rem] top-[12rem] h-[28rem] w-[28rem] rounded-full bg-amber-200/20 blur-[120px]"></div>
      
      <section className="relative pt-8 pb-16 sm:pt-12 sm:pb-24">
        <div className="layout-container">
          <div className="grid items-center gap-12 lg:grid-cols-[1.04fr_0.96fr]">
            <div className="relative z-10">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/85 px-4 py-1.5 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Hiring Platform</span>
              </span>
              <h1 className="heading-hero leading-[1.08]">
                A sharper hiring workspace for candidates and employers.
              </h1>
              <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-surface-700">
                RevHire brings search, resumes, applications, interview tracking, and hiring workflows into a single product surface that feels more like software and less like a template.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link to="/register" className="btn-primary px-8 py-3.5 text-base shadow-brand-500/30">
                  Create an account
                </Link>
                <Link to="/login" className="btn-secondary px-8 py-3.5 text-base shadow-sm">
                  Sign in
                </Link>
              </div>
              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Jobs", value: "Search and apply", accent: "from-brand-500 to-brand-700", note: "Filters + job details" },
                  { label: "Resumes", value: "Build and export", accent: "from-emerald-500 to-emerald-700", note: "Structured resume flow" },
                  { label: "Hiring", value: "Post and review", accent: "from-amber-500 to-orange-600", note: "Applicants + interviews" },
                ].map((item) => (
                  <div key={item.label} className="premium-card border-white/80 bg-white/95 px-5 py-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                       <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br text-white ${item.accent}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"></path></svg>
                       </div>
                       <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-surface-400">{item.label}</p>
                    </div>
                    <p className="text-base font-bold text-surface-900">{item.value}</p>
                    <p className="mt-2 text-sm text-surface-500">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 w-full lg:ml-auto">
              <div className="glass-panel overflow-hidden p-3">
                <div className="relative overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-surface-950 via-brand-900 to-brand-700 p-9 text-white">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_36%)] pointer-events-none"></div>
                  
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-100">Current workflow</p>
                  <h2 className="mt-3 text-[30px] font-bold font-display leading-tight">Built for the real product flows already in this repo</h2>
                  <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/78 font-medium">
                    The platform already supports protected routes, job discovery, saved jobs, resume export, job posting, applicant review, and interview scheduling.
                  </p>
                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {[
                      { label: "Protected", value: "Role aware" },
                      { label: "Dashboard", value: "Action driven" },
                      { label: "Hiring", value: "End to end" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-sm">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">{item.label}</p>
                        <p className="mt-2 font-display text-lg font-semibold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 space-y-3 p-5">
                  {capabilityGroups.map((group) => (
                    <div key={group.title} className="rounded-[1.4rem] border border-surface-200 bg-white/90 p-5 shadow-sm transition-all duration-300 hover:border-brand-200 hover:shadow-md">
                      <h3 className="text-[15px] font-bold text-surface-900 font-display">{group.title}</h3>
                      <ul className="mt-4 space-y-3 text-sm leading-relaxed text-surface-700">
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

      <section className="relative border-y border-white/60 bg-white/55 py-24 backdrop-blur-sm">
        <div className="layout-container">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-flex rounded-full border border-white/80 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-surface-600">Product Overview</span>
            <h2 className="heading-section mt-6">A more intentional visual layer around the existing feature set</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-surface-700 font-medium">
              The redesign leans into clarity, stronger contrast, and better visual grouping without inventing features that the product does not have.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {productNotes.map((item, i) => (
              <article key={item.title} className="premium-card bg-white/92 p-8">
                <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-[1.25rem] ${["bg-brand-50 text-brand-600","bg-emerald-50 text-emerald-600","bg-amber-50 text-amber-600"][i]}`}>
                  <span className="font-display text-xl font-bold">0{i+1}</span>
                </div>
                <h3 className="text-lg font-bold text-surface-900 font-display">{item.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-surface-700 font-medium">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="layout-container">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-white via-[#eef3ff] to-[#f8eede] px-8 py-18 text-center text-surface-900 shadow-[0_24px_70px_rgba(16,28,45,0.12)] sm:px-14">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full border border-brand-100 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full border border-amber-100 pointer-events-none"></div>

            <p className="relative z-10 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-700">Start with the real workflow</p>
            <h2 className="relative z-10 heading-section mt-5 max-w-2xl mx-auto leading-tight">Choose the side of the marketplace you need and move directly into the product.</h2>
            <p className="relative z-10 mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-surface-700 font-medium">
              Create an account to explore the refreshed interface, or sign in and continue from your dashboard.
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

      <footer className="border-t border-white/70 bg-white/45 py-10 text-center text-sm font-medium text-surface-500 backdrop-blur-sm">
        © {new Date().getFullYear()} RevHire Platform
      </footer>
    </div>
  );
}

export default Landing;
