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
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden lg:block">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
            RevHire Portal
          </p>
          <h1 className="mt-4 max-w-lg font-['Plus_Jakarta_Sans'] text-5xl font-bold leading-tight text-slate-900">
            Professional hiring, built for speed and clarity.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Sign in to manage applications, discover jobs, and keep every hiring
            action in one clean workspace.
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
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Sign in to your account
            </p>
          </div>

          <div className="form-panel">
            <form onSubmit={handleSubmit} className="space-y-5">
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
              <PasswordInput
                label="Password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
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
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>

          <p className="text-center text-slate-500 text-sm mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-700 hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
