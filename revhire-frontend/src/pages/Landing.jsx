import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <span className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            🚀 The smarter way to hire & get hired
          </span>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Find Your Next <br />
            <span className="text-indigo-400">Dream Job</span>
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            RevHire connects talented professionals with top employers. Post jobs, apply with ease, and track everything in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link
              to="/register"
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-xl border border-white/10 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-3 gap-8 text-center">
          {[
            { value: "10K+", label: "Jobs Posted" },
            { value: "50K+", label: "Job Seekers" },
            { value: "5K+", label: "Companies" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-indigo-600">{s.value}</p>
              <p className="text-slate-500 text-sm mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900">Everything you need</h2>
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
            <div key={f.title} className="card p-6 hover:shadow-md hover:border-indigo-200 transition-all duration-200">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-semibold text-slate-900 mt-4 mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 mx-6 mb-16 rounded-2xl">
        <div className="max-w-3xl mx-auto px-8 py-14 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to get started?</h2>
          <p className="text-indigo-200 mt-3 mb-8">Join thousands of professionals already using RevHire.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-indigo-600 font-semibold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-colors">
              Create Account
            </Link>
            <Link to="/login" className="border border-white/30 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">
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
