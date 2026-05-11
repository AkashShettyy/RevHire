import { Link } from "react-router-dom";

const highlights = [
  { label: "Intelligent Sourcing", text: "Discover top-tier talent with AI-driven matching and smart applicant tracking." },
  { label: "Seamless Collaboration", text: "Unify your hiring team with organizational workflows, shared feedback, and real-time alerts." },
  { label: "Premium Candidate Experience", text: "Offer a frictionless, beautifully-designed application process that elevates your employer brand." },
];

function Landing() {
  return (
    <div className="app-shell min-h-screen bg-surface-50 font-sans">
      <section className="relative overflow-hidden py-10 sm:py-16 lg:py-10">
        <div className="layout-container relative z-10">
          <div className="page-hero grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr] relative backdrop-blur-2xl bg-white/70 border border-brand-100 shadow-[0_20px_60px_-15px_rgba(37,99,235,0.15)] overflow-visible">
            <div className="absolute top-0 left-0 w-72 h-72 bg-brand-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-30 animate-[pulse_6s_ease-in-out_infinite]"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-violet-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-30 animate-[pulse_6s_ease-in-out_infinite_2s]"></div>
            <div className="relative z-10 space-y-8">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-brand-200/80 bg-brand-50/80 backdrop-blur-md px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-700 shadow-sm ring-1 ring-inset ring-brand-300/20 transition-all hover:scale-105 hover:shadow-md">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500"></span>
                </span>
                Next-Gen Hiring Platform
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-[1.1]">
                <span className="block text-surface-900 drop-shadow-sm">Hire the best.</span>
                <span className="block mt-2 bg-gradient-to-r from-brand-600 via-brand-500 to-violet-500 bg-clip-text text-transparent pb-2 drop-shadow-sm">Zero friction.</span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-surface-600 sm:text-xl font-medium">
                RevHire is the unified workspace where ambitious teams collaborate seamlessly to source, evaluate, and hire extraordinary talent at scale.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center pt-2">
                <Link to="/register" className="group relative flex items-center justify-center rounded-xl px-8 py-4 text-base font-bold text-white transition-all overflow-hidden bg-brand-600 hover:shadow-[0_8px_30px_rgb(37,99,235,0.3)] hover:-translate-y-0.5 border border-transparent">
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-brand-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center gap-2 drop-shadow-md">
                    Create Account
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
                <Link to="/login" className="flex items-center justify-center rounded-xl border-2 border-surface-200 bg-white/50 backdrop-blur-sm px-8 py-4 text-base font-bold text-surface-900 shadow-sm transition-all hover:bg-white hover:border-surface-300 hover:shadow-md hover:-translate-y-0.5">
                  Sign in
                </Link>
              </div>
            </div>

            <div className="glass-panel group relative rounded-2xl p-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_70px_-15px_rgba(37,99,235,0.3)]">
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-tr from-brand-500/20 to-violet-500/20 blur-2xl transition-all duration-500 group-hover:from-brand-500/30 group-hover:to-violet-500/30 group-hover:blur-3xl"></div>
              <div className="rounded-xl bg-gradient-to-br from-surface-900 via-surface-900 to-[#1e1b4b] p-8 text-white shadow-inner ring-1 ring-white/10 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500 rounded-full mix-blend-screen filter blur-[60px] opacity-20"></div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-300 mb-2">Elevated Workflows</p>
                <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight drop-shadow-sm">Recruitment, refined.</h2>
                <div className="mt-8 grid gap-4 relative z-10">
                  {highlights.map((item) => (
                    <div key={item.label} className="group/item relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:bg-white/10 hover:border-brand-400/30 hover:scale-[1.02]">
                      <div className="absolute inset-0 opacity-0 group-hover/item:opacity-100 bg-gradient-to-r from-brand-400/10 to-transparent transition-opacity duration-300"></div>
                      <p className="relative text-base font-bold text-white mb-1.5 drop-shadow-sm">{item.label}</p>
                      <p className="relative text-sm leading-relaxed text-surface-300">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-surface-50"></div>
        <div className="absolute inset-y-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="layout-container relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20 fade-in-up">
            <h2 className="text-3xl font-extrabold tracking-tight text-surface-900 sm:text-5xl">Everything you need to <span className="bg-gradient-to-r from-brand-600 to-violet-500 bg-clip-text text-transparent">scale your team</span></h2>
            <p className="mt-6 text-lg leading-relaxed text-surface-600">A powerful suite of tools designed to remove operational overhead and let you focus on finding the perfect fit.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {highlights.map((item, idx) => (
              <article key={item.label} className="premium-card group rounded-2xl border border-surface-200/60 bg-white/60 backdrop-blur-xl p-8 shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-brand-200">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-6 text-brand-600 group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {idx === 0 ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /> :
                      idx === 1 ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> :
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />}
                  </svg>
                </div>
                <h3 className="font-display text-xl font-bold text-surface-900 group-hover:text-brand-700 transition-colors duration-300">{item.label}</h3>
                <p className="mt-4 text-base leading-relaxed text-surface-600">{item.text}</p>
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-500 group-hover:w-full"></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface-50 py-20 border-t border-surface-100">
        <div className="layout-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-surface-900">How it works</h2>
            <p className="mt-3 text-surface-600">Get started in three simple steps.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "Create Account", desc: "Sign up as a job seeker or employer in under a minute. No credit card needed." },
              { step: "02", title: "Set Up Profile", desc: "Build your resume or post your first job listing with all the details." },
              { step: "03", title: "Connect & Hire", desc: "Apply to jobs or review applicants and move them through your hiring pipeline." },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-lg font-extrabold text-white shadow-lg shadow-brand-500/25 mb-5">{s.step}</div>
                <h3 className="font-bold text-surface-900 text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-surface-600 leading-relaxed max-w-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20 border-t border-surface-100">
        <div className="layout-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-surface-900">Trusted by professionals</h2>
            <p className="mt-3 text-surface-600">Here's what our users say about RevHire.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "Priya S.", role: "Software Engineer", text: "Found my dream job in 2 weeks. The resume builder and application tracking made everything so easy." },
              { name: "Rahul M.", role: "HR Manager", text: "Posting jobs and reviewing applicants is seamless. The kanban board for applicants is a game changer." },
              { name: "Ananya K.", role: "Product Designer", text: "The interview calendar kept me organized across multiple companies. Highly recommend RevHire." },
            ].map((t) => (
              <div key={t.name} className="premium-card p-6 bg-white">
                <p className="text-surface-700 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">{t.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-bold text-surface-900">{t.name}</p>
                    <p className="text-xs text-surface-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-surface-200/60 bg-white py-6 text-center text-sm font-medium text-surface-500 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-200 to-transparent"></div>
        <div className="layout-container relative z-10 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white shadow-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-display font-bold text-surface-900 text-lg tracking-tight">RevHire</span>
          </div>
          <p className="text-surface-500">© {new Date().getFullYear()} RevHire. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-brand-600 transition-colors duration-300">Privacy Policy</a>
            <a href="#" className="hover:text-brand-600 transition-colors duration-300">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
