import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import PasswordInput from "../components/PasswordInput";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
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
      const data = await loginUser(formData);
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
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl pointer-events-none"></div>
      
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] z-10">
        <div className="hidden lg:block pr-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-700">RevHire Portal</span>
          </div>
          <h1 className="heading-hero leading-[1.15]">
            Professional hiring, built for speed.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-surface-600">
            Sign in to manage applications, discover jobs, and keep every hiring
            action in one beautifully designed workspace.
          </p>
          
          <div className="mt-12 flex items-center gap-5">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center font-bold text-white text-xs ${['bg-brand-500', 'bg-violet-500', 'bg-indigo-500', 'bg-blue-500'][i-1]}`}>
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="text-sm font-medium text-surface-600">
              <span className="font-bold text-surface-900">10k+</span> professionals hired
            </div>
          </div>
        </div>

        <div className="w-full max-w-[440px] justify-self-center lg:justify-self-end">
          <div className="text-center mb-10 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2 text-surface-900 mb-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-md">
                RH
              </span>
              <span className="font-['Outfit'] text-2xl font-bold tracking-tight">RevHire</span>
            </Link>
          </div>

          <div className="premium-card p-8 sm:p-10 w-full backdrop-blur-xl bg-white/90">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-surface-900 font-['Outfit']">Welcome back</h2>
              <p className="mt-1.5 text-sm text-surface-500">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label-text">
                  Email Configuration
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
              <PasswordInput
                label="Password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-surface-600 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500" />
                  Remember me
                </label>
                <a href="#" className="font-semibold text-brand-600 hover:text-brand-700">Forgot password?</a>
              </div>

              {error && (
                <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 animate-fade-in">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3.5 text-[15px] shadow-brand-500/30 font-bold mt-2"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>

          <p className="text-center text-surface-500 text-sm mt-8 font-medium">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
