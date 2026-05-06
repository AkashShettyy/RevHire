import { Link } from "react-router-dom";

const highlights = [
  { label: "Intelligent Sourcing", text: "Discover top-tier talent with AI-driven matching and smart applicant tracking." },
  { label: "Seamless Collaboration", text: "Unify your hiring team with organizational workflows, shared feedback, and real-time alerts." },
  { label: "Premium Candidate Experience", text: "Offer a frictionless, beautifully-designed application process that elevates your employer brand." },
];

function Landing() {
  return (
    <div className="app-shell min-h-screen bg-surface-50 font-sans">
      <section className="relative overflow-hidden pt-20 pb-24 sm:py-32 lg:pb-32 lg:pt-40">
        <div className="layout-container relative z-10">
          <div className="page-hero grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative">
              <span className="eyebrow inline-block rounded-full bg-brand-100/50 px-3 py-1 text-xs font-semibold tracking-wider text-brand-700 ring-1 ring-inset ring-brand-200/50">Next-Gen Hiring Platform</span>
              <h1 className="heading-hero mt-8 text-5xl font-extrabold tracking-tight text-surface-900 sm:text-6xl lg:text-7xl leading-[1.1]">
                Hire the best. <br />
                <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">Zero friction.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-surface-600 sm:text-xl">
                RevHire is the unified workspace where ambitious teams collaborate seamlessly to source, evaluate, and hire extraordinary talent at scale.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link to="/register" className="btn-primary flex items-center justify-center rounded-xl bg-brand-600 px-8 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-brand-500 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
                  Create Account
                </Link>
                <Link to="/login" className="btn-secondary flex items-center justify-center rounded-xl border border-surface-200 bg-white px-8 py-4 text-base font-semibold text-surface-900 shadow-sm transition-all hover:bg-surface-50 hover:border-surface-300">
                  Sign in
                </Link>
              </div>
            </div>

            <div className="glass-panel group relative rounded-2xl p-2 shadow-2xl transition-transform duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-tr from-brand-500/10 to-brand-300/10 blur-2xl transition-all duration-500 group-hover:from-brand-500/20 group-hover:to-brand-300/20"></div>
              <div className="rounded-xl bg-gradient-to-br from-surface-900 via-surface-800 to-brand-900 p-8 text-white shadow-inner ring-1 ring-white/10">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-300">Elevated Workflows</p>
                <h2 className="mt-4 font-display text-3xl font-bold tracking-tight">Recruitment, refined.</h2>
                <div className="mt-8 grid gap-4">
                  {highlights.map((item) => (
                    <div key={item.label} className="rounded-xl border border-white/5 bg-white/5 p-5 transition-all duration-300 hover:bg-white/10">
                      <p className="text-base font-bold text-white mb-1.5">{item.label}</p>
                      <p className="text-sm leading-relaxed text-surface-300">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-surface-200 bg-white py-20 relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay"></div>
        <div className="layout-container relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">Everything you need to scale your team</h2>
            <p className="mt-4 text-lg text-surface-600">A powerful suite of tools designed to remove operational overhead and let you focus on finding the perfect fit.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {highlights.map((item) => (
              <article key={item.label} className="premium-card group rounded-2xl border border-surface-200 bg-surface-50/50 p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:bg-white hover:-translate-y-1 hover:border-brand-100">
                <h3 className="font-display text-xl font-bold text-surface-900 group-hover:text-brand-700 transition-colors">{item.label}</h3>
                <p className="mt-4 text-base leading-relaxed text-surface-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-surface-200 bg-surface-50 py-12 text-center text-sm font-medium text-surface-500">
        <div className="layout-container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p>© {new Date().getFullYear()} RevHire. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-surface-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-surface-900 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
