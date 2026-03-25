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
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden lg:block">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
            Start Hiring Better
          </p>
          <h1 className="mt-4 max-w-lg font-['Plus_Jakarta_Sans'] text-5xl font-bold leading-tight text-slate-900">
            Build a profile that looks ready for a real job portal.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Join as a job seeker or employer and manage resumes, jobs, and
            applicants with a polished hiring workflow.
          </p>
        </div>

        <div className="w-full max-w-md justify-self-center">
          <div className="text-center mb-8">
            <Link
              to="/"
              className="text-2xl font-extrabold tracking-tight text-blue-700"
            >
              RevHire
            </Link>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Join thousands of professionals
            </p>
          </div>

          <div className="form-panel">
            <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
              {["jobseeker", "employer"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: r })}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                    formData.role === r
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {r === "jobseeker" ? "Job Seeker" : "Employer"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
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
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
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
                <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                  <div className="flex gap-4 mb-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                      <input type="radio" checked={orgFlow === "create"} onChange={() => setOrgFlow("create")} name="orgFlow" className="w-4 h-4 text-blue-600" />
                      Create Company
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                      <input type="radio" checked={orgFlow === "join"} onChange={() => setOrgFlow("join")} name="orgFlow" className="w-4 h-4 text-blue-600" />
                      Join Existing
                    </label>
                  </div>
                  
                  {orgFlow === "create" ? (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name</label>
                      <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required className="input-field" placeholder="e.g. Acme Corp" />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Join Code</label>
                      <input type="text" name="joinCode" value={formData.joinCode} onChange={handleChange} required className="input-field" placeholder="e.g. AB12CD" />
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
                <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  <span>⚠️</span> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3 text-base"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          </div>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-700 hover:underline"
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
