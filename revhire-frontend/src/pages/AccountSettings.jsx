import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";
import { changePassword } from "../services/authService";

function AccountSettings() {
  const { token } = useAuth();
  const [formData, setFormData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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
    <div className="app-page">
      <div className="app-hero">
        <div className="app-shell max-w-3xl py-8">
          <div className="app-spotlight px-6 py-7 sm:px-8">
            <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr] lg:items-end">
              <div>
                <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                  Account settings
                </span>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Account Settings</h1>
                <p className="mt-3 text-sm leading-6 text-white/76">Manage your sign-in credentials and keep your account secure.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[26px] border border-white/16 bg-white/10 px-4 py-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Security</p>
                  <p className="mt-3 text-lg font-bold text-white">Password controls</p>
                </div>
                <div className="rounded-[26px] border border-white/16 bg-white/10 px-4 py-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Best practice</p>
                  <p className="mt-3 text-lg font-bold text-white">Use a unique password</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="app-shell max-w-3xl py-8">
        <div className="app-panel p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-stone-900">Change Password</h2>
            <p className="mt-1 text-sm text-stone-500">Use a password you do not reuse elsewhere.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <PasswordInput
              label="Current Password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              autoComplete="current-password"
              className="app-input"
              required
            />
            <PasswordInput
              label="New Password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              className="app-input"
              required
            />
            <PasswordInput
              label="Confirm New Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter new password"
              autoComplete="new-password"
              className="app-input"
              required
            />

            {message.text && (
              <div className={message.type === "success" ? "app-message-success" : "app-message-error"}>
                {message.text}
              </div>
            )}

            <button type="submit" disabled={isLoading} className="app-button">
              {isLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AccountSettings;
