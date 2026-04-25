import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";
import { changePassword } from "../services/authService";

function getPasswordStrength(password) {
  let score = 0;

  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { label: "Weak", color: "bg-error-500", text: "text-error-700", bars: 1 };
  if (score <= 3) return { label: "Medium", color: "bg-amber-500", text: "text-amber-700", bars: 3 };
  return { label: "Strong", color: "bg-emerald-500", text: "text-emerald-700", bars: 5 };
}

function AccountSettings() {
  const { token } = useAuth();
  const [formData, setFormData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const passwordStrength = getPasswordStrength(formData.newPassword);
  const passwordsMatch = formData.confirmPassword.length > 0 && formData.newPassword === formData.confirmPassword;
  const passwordChecks = [
    { label: "At least 6 characters", passed: formData.newPassword.length >= 6 },
    { label: "Includes upper and lower case", passed: /[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword) },
    { label: "Includes a number", passed: /\d/.test(formData.newPassword) },
    { label: "Matches confirmation", passed: passwordsMatch },
  ];

  function handleChange(event) {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    if (formData.newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "New password and confirm password must match." });
      return;
    }

    setIsLoading(true);
    try {
      const data = await changePassword(
        { currentPassword: formData.currentPassword, newPassword: formData.newPassword },
        token,
      );
      setMessage({ type: "success", text: data.message || "Password updated successfully." });
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Unable to update password." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="layout-container max-w-5xl py-12">
        <div className="page-hero mb-8 grid gap-6 lg:grid-cols-[1.1fr,0.9fr] lg:items-end">
          <div>
            <span className="eyebrow">Account Settings</span>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">Security preferences with clearer guidance</h1>
            <p className="mt-3 max-w-2xl text-sm text-surface-700 sm:text-base">
              Update your sign-in password with live checks so you can see strength and confirmation state before submitting.
            </p>
          </div>
            <div className="grid gap-3 sm:grid-cols-2">
            <div className="metric-tile ring-1 ring-white/70">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-surface-500">Password strength</p>
              <p className={`mt-3 font-display text-3xl font-semibold ${formData.newPassword ? passwordStrength.text : "text-surface-900"}`}>
                {formData.newPassword ? passwordStrength.label : "Not set"}
              </p>
            </div>
            <div className="metric-tile ring-1 ring-white/70">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-surface-500">Confirmation</p>
              <p className={`mt-3 font-display text-3xl font-semibold ${passwordsMatch ? "text-emerald-700" : "text-surface-900"}`}>
                {formData.confirmPassword ? (passwordsMatch ? "Matched" : "Pending") : "Waiting"}
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr,0.8fr]">
          <section className="section-card p-6 sm:p-8">
            <div className="mb-6 border-b border-surface-200 pb-4">
              <h2 className="text-lg font-semibold text-surface-900">Change Password</h2>
              <p className="mt-1 text-sm text-surface-700">Update your sign-in password below.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <PasswordInput
                label="Current Password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                autoComplete="current-password"
                className="input-field"
                required
              />
              <PasswordInput
                label="New Password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                className="input-field"
                required
              />
              <div className="rounded-[1.25rem] border border-surface-200 bg-surface-50/80 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-surface-800">Strength</p>
                  <p className={`text-sm font-semibold ${formData.newPassword ? passwordStrength.text : "text-surface-500"}`}>
                    {formData.newPassword ? passwordStrength.label : "Enter a new password"}
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((bar) => (
                    <div
                      key={bar}
                      className={`h-2 rounded-full ${
                        formData.newPassword && bar <= passwordStrength.bars
                          ? passwordStrength.color
                          : "bg-surface-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <PasswordInput
                label="Confirm New Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter new password"
                autoComplete="new-password"
                className="input-field"
                required
              />

              {message.text && (
                <div className={message.type === "success" ? "rounded-lg border border-success-200 bg-success-50 p-3 text-sm font-medium text-success-800" : "rounded-lg border border-error-200 bg-error-50 p-3 text-sm font-medium text-error-800"}>
                  {message.text}
                </div>
              )}

              <div className="pt-2">
                <button type="submit" disabled={isLoading} className="btn-primary w-full sm:w-auto">
                  {isLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </section>

          <aside className="section-card p-6 sm:p-8">
            <div className="border-b border-surface-200 pb-4">
              <h2 className="text-lg font-semibold text-surface-900">Live checklist</h2>
              <p className="mt-1 text-sm text-surface-700">Use this as a quick quality check before saving.</p>
            </div>

            <div className="mt-5 space-y-3">
              {passwordChecks.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 rounded-[1rem] border px-4 py-3 shadow-sm transition-colors ${
                    item.passed
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-surface-200 bg-white text-surface-600"
                  }`}
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    item.passed ? "bg-emerald-600 text-white" : "bg-surface-100 text-surface-500"
                  }`}>
                    {item.passed ? "✓" : "•"}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.25rem] border border-brand-100 bg-brand-50/70 p-4">
              <p className="text-sm font-semibold text-surface-800">Security note</p>
              <p className="mt-2 text-sm leading-6 text-surface-700">
                Longer passwords with a mix of letters, numbers, and symbols are harder to guess and easier to keep secure over time.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default AccountSettings;
