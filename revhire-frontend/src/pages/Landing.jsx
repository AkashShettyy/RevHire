import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-[linear-gradient(135deg,#082f49_0%,#0f172a_50%,#164e63_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(103,232,249,0.28),transparent_26%),radial-gradient(circle_at_80%_20%,_rgba(34,197,94,0.22),transparent_22%)]" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-cyan-100 backdrop-blur-md">
            Smarter hiring for modern teams
          </span>
          <h1 className="font-['Space_Grotesk'] text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
            Hire Fast.
            <br />
            <span className="text-cyan-300">Apply Sharp.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            RevHire connects ambitious candidates with focused employers through clean job discovery, structured resumes, and applicant review that actually scales.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="rounded-2xl bg-white px-8 py-3.5 font-semibold text-slate-900 transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-50"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="rounded-2xl border border-white/15 bg-white/10 px-8 py-3.5 font-semibold text-white transition-all duration-200 hover:bg-white/20"
            >
              Sign In
            </Link>
          </div>
          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-4 text-left sm:grid-cols-3">
            {[
              { title: "Resume Builder", desc: "Structured profiles that are easy to review and export." },
              { title: "Applicant Review", desc: "Shortlist faster with resume preview and cover letter context." },
              { title: "Live Tracking", desc: "Keep hiring and application status visible in one flow." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                <p className="font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b border-white/60">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-3 gap-8 text-center">
          {[
            { value: "10K+", label: "Jobs Posted" },
            { value: "50K+", label: "Job Seekers" },
            { value: "5K+", label: "Companies" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-['Space_Grotesk'] text-3xl font-bold text-cyan-700">{s.value}</p>
              <p className="mt-1 text-sm font-medium text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="section-title">Everything you need</h2>
          <p className="text-slate-500 mt-3 max-w-md mx-auto">Built for both job seekers and employers with powerful tools to streamline hiring.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: "🔍", title: "Smart Job Search", desc: "Filter by role, location, type, and experience to find the perfect match." },
            { icon: "📄", title: "Resume Builder", desc: "Build a professional resume with education, experience, skills, and projects." },
            { icon: "📋", title: "Application Tracking", desc: "Track every application and get real-time status updates from employers." },
            { icon: "🏢", title: "Job Posting", desc: "Employers can post detailed job listings and manage them with ease." },
            { icon: "👥", title: "Applicant Review", desc: "Review candidates, read cover letters, and shortlist or reject with one click." },
            { icon: "🔔", title: "Notifications", desc: "Instant notifications for application updates and new candidates." },
          ].map((f) => (
            <div key={f.title} className="card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-cyan-200">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-semibold text-slate-900 mt-4 mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mx-6 mb-16 rounded-[2rem] bg-[linear-gradient(135deg,#0f766e_0%,#0369a1_100%)] shadow-[0_30px_80px_-32px_rgba(8,47,73,0.6)]">
        <div className="max-w-3xl mx-auto px-8 py-14 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to get started?</h2>
          <p className="mt-3 mb-8 text-cyan-100">Join thousands of professionals already using RevHire.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="rounded-2xl bg-white px-8 py-3 font-semibold text-cyan-800 transition-colors hover:bg-cyan-50">
              Create Account
            </Link>
            <Link to="/login" className="rounded-2xl border border-white/30 px-8 py-3 font-semibold text-white transition-colors hover:bg-white/10">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 text-center text-slate-400 text-sm">
        © {new Date().getFullYear()} RevHire. All rights reserved.
      </footer>
    </div>
  );
}

export default Landing;
