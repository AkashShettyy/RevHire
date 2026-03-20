import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-blue-100 bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),transparent_24%),radial-gradient(circle_at_80%_10%,_rgba(96,165,250,0.14),transparent_18%)]" />
        <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-24">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700">
            Trusted by modern hiring teams
          </span>
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h1 className="font-['Plus_Jakarta_Sans'] text-5xl font-bold leading-tight tracking-tight text-slate-900 sm:text-6xl">
                Your complete
                <br />
                <span className="text-blue-700">job portal</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Browse jobs, manage applications, build polished resumes, and review applicants in a clean interface inspired by real hiring platforms.
              </p>
              <div className="mt-10 flex flex-col justify-start gap-4 sm:flex-row">
                <Link
                  to="/register"
                  className="btn-primary px-8 py-3.5"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="rounded-2xl border border-slate-200 bg-white px-8 py-3.5 font-semibold text-slate-700 transition-all duration-200 hover:border-blue-200 hover:text-blue-700"
                >
                  Sign In
                </Link>
              </div>
              <div className="mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { label: "10K+", desc: "Jobs posted" },
                  { label: "50K+", desc: "Candidates" },
                  { label: "5K+", desc: "Companies" },
                ].map((item) => (
                  <div key={item.desc} className="card px-5 py-5">
                    <p className="font-['Plus_Jakarta_Sans'] text-3xl font-bold text-blue-700">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5 sm:p-6">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
                <p className="text-sm font-semibold text-blue-700">Featured Role</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">Senior Frontend Engineer</h3>
                <p className="mt-1 text-sm text-slate-600">BlueWave Technologies · Bengaluru</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["React", "TypeScript", "Design Systems"].map((skill) => (
                    <span key={skill} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700">{skill}</span>
                  ))}
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {[
                  { title: "Professional job cards", desc: "Clear company, role, location, salary, and skills layout." },
                  { title: "Employer dashboards", desc: "See applicants, manage posts, and monitor hiring activity." },
                  { title: "Resume workflows", desc: "Build, preview, and export polished resumes quickly." },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 transition-all duration-200 hover:border-blue-200 hover:shadow-lg">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
            <div key={f.title} className="card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-semibold text-slate-900 mt-4 mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mx-6 mb-16 rounded-[2rem] bg-[linear-gradient(135deg,#2563eb_0%,#1d4ed8_100%)] shadow-[0_30px_80px_-32px_rgba(29,78,216,0.5)]">
        <div className="max-w-3xl mx-auto px-8 py-14 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to get started?</h2>
          <p className="mt-3 mb-8 text-blue-100">Join thousands of professionals already using RevHire.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="rounded-2xl bg-white px-8 py-3 font-semibold text-blue-700 transition-colors hover:bg-blue-50">
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
