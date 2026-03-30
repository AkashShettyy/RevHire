import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import PasswordInput from "../components/PasswordInput";

function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "jobseeker",
    companyName: "",
    joinCode: "",
  });
  const [orgFlow, setOrgFlow] = useState("create");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const data = await registerUser(formData);
      login(data.user, data.token);
      navigate(
        data.user.role === "employer" ? "/employer/dashboard" : "/dashboard",
      );
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-10 flex items-center justify-center relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 -ml-20 -mt-20 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 -mr-20 -mb-20 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl pointer-events-none"></div>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] z-10">
        <div className="hidden lg:block pr-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-700">Start Hiring Better</span>
          </div>
          <h1 className="heading-hero leading-[1.15]">
            Build a profile that stands out truly.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-surface-600">
            Join as a job seeker or employer and experience a seamlessly designed platform for a polished hiring workflow.
          </p>
          
          <div className="mt-10 grid grid-cols-2 gap-6">
            <div className="premium-card p-5 bg-white/80 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <h3 className="font-bold text-surface-900 mb-1 text-sm">Job Seekers</h3>
              <p className="text-xs text-surface-500 leading-relaxed">Build beautiful resumes and track applications in real-time.</p>
            </div>
            <div className="premium-card p-5 bg-white/80 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18"></path><path d="M9 8h1"></path><path d="M9 12h1"></path><path d="M9 16h1"></path><path d="M14 8h1"></path><path d="M14 12h1"></path><path d="M14 16h1"></path><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path></svg>
              </div>
              <h3 className="font-bold text-surface-900 mb-1 text-sm">Employers</h3>
              <p className="text-xs text-surface-500 leading-relaxed">Collaborate with your team and manage top talent efficiently.</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[440px] justify-self-center lg:justify-self-end">
          <div className="text-center mb-8 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2 text-surface-900 mb-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-md">
                RH
              </span>
              <span className="font-['Outfit'] text-2xl font-bold tracking-tight">RevHire</span>
            </Link>
          </div>

          <div className="premium-card p-8 sm:p-10 w-full backdrop-blur-xl bg-white/90">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-surface-900 font-['Outfit']">Create an account</h2>
              <p className="mt-1.5 text-sm text-surface-500">Choose your account type to get started.</p>
            </div>

            <div className="mb-6 flex rounded-xl bg-surface-100/80 p-1.5 border border-surface-200">
              {["jobseeker", "employer"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: r })}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all duration-300 ${
                    formData.role === r
                      ? "bg-white text-brand-700 shadow shadow-surface-200/50"
                      : "text-surface-500 hover:text-surface-800"
                  }`}
                >
                  {r === "jobseeker" ? "Job Seeker" : "Employer"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-text">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
              
              {formData.role === "employer" && (
                <div className="space-y-4 rounded-2xl border border-brand-100 bg-brand-50/40 p-5 mt-2 transition-all">
                  <div className="flex gap-5 mb-1">
                    <label className="flex items-center gap-2.5 text-sm font-semibold text-surface-700 cursor-pointer">
                      <input type="radio" checked={orgFlow === "create"} onChange={() => setOrgFlow("create")} name="orgFlow" className="w-4 h-4 text-brand-600 focus:ring-brand-500 border-surface-300" />
                      Create Company
                    </label>
                    <label className="flex items-center gap-2.5 text-sm font-semibold text-surface-700 cursor-pointer">
                      <input type="radio" checked={orgFlow === "join"} onChange={() => setOrgFlow("join")} name="orgFlow" className="w-4 h-4 text-brand-600 focus:ring-brand-500 border-surface-300" />
                      Join Existing
                    </label>
                  </div>
                  
                  {orgFlow === "create" ? (
                    <div className="animate-fade-in">
                      <label className="label-text">Company Name</label>
                      <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required className="input-field bg-white/80" placeholder="e.g. Acme Corp" />
                    </div>
                  ) : (
                    <div className="animate-fade-in">
                      <label className="label-text">Join Code</label>
                      <input type="text" name="joinCode" value={formData.joinCode} onChange={handleChange} required className="input-field bg-white/80 font-mono tracking-wider" placeholder="e.g. AB12CD" />
                    </div>
                  )}
                </div>
              )}

              <PasswordInput
                label="Password"
                name="password"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />

              {error && (
                <div className="flex items-center gap-3 mt-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 animate-fade-in">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3.5 text-[15px] shadow-brand-500/30 font-bold"
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>

          <p className="text-center text-surface-500 text-sm mt-8 font-medium">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
