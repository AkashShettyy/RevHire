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
    <div className="app-shell">
      <div className="layout-container max-w-5xl py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-surface-900">Account Settings</h1>
          <p className="mt-2 text-sm text-surface-700">Manage password and account security.</p>
        </div>

        <div className="mx-auto max-w-3xl">
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
        </div>
      </div>
    </div>
  );
}

export default AccountSettings;
