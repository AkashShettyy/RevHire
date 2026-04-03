import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCallback, useEffect, useState } from "react";
import { getNotifications, markAllRead } from "../services/notificationService";

function Navbar() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!token || !user) return;
    try {
      const data = await getNotifications(token);
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error(error);
    }
  }, [token, user]);

  useEffect(() => {
    if (!token || !user) return;

    fetchNotifications();
    const intervalId = window.setInterval(fetchNotifications, 15000);

    return () => window.clearInterval(intervalId);
  }, [fetchNotifications, token, user]);

  async function handleMarkAllRead() {
    try {
      await markAllRead(token);
      setNotifications(notifications.map((n) => ({ ...n, status: "read" })));
    } catch (error) {
      console.error(error);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const unreadCount = notifications.filter((n) => n.status === "unread").length;
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  const navItems = user
    ? user.role === "jobseeker"
      ? [
          { to: "/jobs", label: "Find Jobs" },
          { to: "/saved-jobs", label: "Saved" },
          { to: "/applications", label: "Applications" },
          { to: "/interviews", label: "Interviews" },
          { to: "/notifications", label: "Notifications" },
          { to: "/resume", label: "Resume" },
          { to: "/settings", label: "Settings" },
        ].filter(Boolean)
      : [
          { to: "/employer/post-job", label: "Post a Job" },
          { to: "/interviews", label: "Interviews" },
          { to: "/notifications", label: "Notifications" },
          { to: "/settings", label: "Settings" },
        ].filter(Boolean)
    : [];

  if (isAuthPage) {
    return (
      <nav className="sticky top-0 z-50 border-b border-white/50 bg-white/60 backdrop-blur-xl">
        <div className="layout-container flex h-20 items-center">
          <Link to="/" className="inline-flex items-center gap-3 text-surface-900 group">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-surface-950 via-brand-700 to-brand-500 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(29,78,216,0.24)] transition-transform duration-300 group-hover:scale-105">
              RH
            </span>
            <span className="block font-display text-xl font-bold tracking-tight">RevHire</span>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/50 bg-[#f7f3ec]/75 backdrop-blur-xl">
      <div className="layout-container flex h-[4.65rem] items-center justify-between">
        <Link
          to={user ? (user.role === "employer" ? "/employer/dashboard" : "/dashboard") : "/"}
          className="inline-flex items-center gap-3 text-surface-900 group"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-surface-950 via-brand-700 to-brand-500 text-xs font-bold text-white shadow-[0_14px_30px_rgba(29,78,216,0.22)]">
            RH
          </span>
          <span className="block font-display text-lg font-semibold tracking-tight">RevHire</span>
        </Link>

        <div className="hidden items-center gap-3 xl:flex">
          {user ? (
            <>
              <div className="flex items-center gap-1 rounded-full border border-white/70 bg-white/80 p-1.5 shadow-[0_14px_30px_rgba(16,28,45,0.08)] backdrop-blur-sm">
                {navItems.map((item) => (
                  <Link key={item.to} to={item.to} onClick={() => { setShowNotifications(false); setShowMobileMenu(false); }} className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-150 ${location.pathname === item.to ? "bg-surface-950 text-white shadow-[0_10px_20px_rgba(16,28,45,0.18)]" : "text-surface-600 hover:bg-white hover:text-surface-900"}`}>
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="relative ml-2">
                <button
                  onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) fetchNotifications(); }}
                  className={`relative flex h-10 w-10 items-center justify-center rounded-2xl border transition-colors duration-150 ${
                    unreadCount > 0
                      ? "border-brand-300 bg-brand-50 text-brand-700 shadow-[0_12px_24px_rgba(29,78,216,0.14)]"
                      : "border-white/80 bg-white/85 text-surface-600 hover:border-brand-200 hover:text-brand-700"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 outline outline-2 outline-white text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/95 shadow-[0_28px_60px_rgba(16,28,45,0.16)] animate-fade-in backdrop-blur-xl">
                    <div className="flex items-center justify-between border-b border-surface-100 px-5 py-4">
                      <p className="text-sm font-semibold text-surface-900">Notifications</p>
                      <div className="flex items-center gap-3">
                        <Link
                          to="/notifications"
                          onClick={() => setShowNotifications(false)}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                        >
                          View all
                        </Link>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} className="text-xs font-semibold text-surface-500 hover:text-surface-800">
                            Mark all read
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center">
                          <p className="text-sm text-surface-400">You're all caught up!</p>
                        </div>
                      ) : (
                        notifications.slice(0, 6).map((n) => (
                          <div key={n._id} className={`border-b border-surface-100 px-5 py-4 last:border-0 hover:bg-surface-50 transition-colors ${n.status === "unread" ? "bg-surface-50/50" : ""}`}>
                            <p className={`text-sm ${n.status === "unread" ? "font-medium text-surface-900" : "text-surface-600"}`}>{n.message}</p>
                            <p className="mt-1.5 text-[11px] font-medium text-surface-400">{new Date(n.createdAt).toLocaleDateString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/85 py-1.5 pl-1.5 pr-4 shadow-[0_14px_30px_rgba(16,28,45,0.08)]">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-50 to-cyan-50 text-sm font-semibold text-brand-700">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-medium text-surface-800">{user.name}</p>
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-surface-500">{user.role === "employer" ? "Employer" : "Job Seeker"}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn-secondary ml-1"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => { setShowNotifications(false); setShowMobileMenu(false); }} className="btn-ghost">Sign In</Link>
              <Link to="/register" onClick={() => { setShowNotifications(false); setShowMobileMenu(false); }} className="btn-primary">Create Account</Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          {!user && <Link to="/login" className="text-sm font-medium text-surface-600">Sign In</Link>}
          <button
            type="button"
            onClick={() => setShowMobileMenu((current) => !current)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/80 bg-white/85 text-surface-700 transition-colors hover:bg-white"
            aria-label="Toggle navigation menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showMobileMenu ? "M6 18L18 6M6 6l12 12" : "M4 7h16M4 12h16M4 17h16"} />
            </svg>
          </button>
        </div>
      </div>

      {showMobileMenu && (
        <div className="animate-fade-in rounded-b-[1.75rem] border-t border-white/60 bg-[#f8f5ef]/95 pb-5 shadow-[0_30px_60px_rgba(16,28,45,0.16)] xl:hidden backdrop-blur-xl">
          <div className="layout-container py-6">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-cyan-50 text-lg font-bold text-brand-700 shadow-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-base font-bold text-surface-900">{user.name}</p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">{user.role === "employer" ? "Employer" : "Job Seeker"}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {navItems.map((item) => (
                    <Link key={item.to} to={item.to} onClick={() => { setShowMobileMenu(false); setShowNotifications(false); }} className={`flex flex-col items-center justify-center rounded-[1.25rem] border p-4 text-sm font-bold transition-all ${location.pathname === item.to ? "border-surface-950 bg-surface-950 text-white" : "border-white/70 bg-white/85 text-surface-700 hover:bg-white"}`}>
                      {item.label}
                    </Link>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-4 w-full rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-sm font-bold text-rose-600 transition-colors hover:bg-rose-100"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/register" onClick={() => setShowMobileMenu(false)} className="btn-primary w-full py-3 text-lg">Create Account</Link>
                <Link to="/login" onClick={() => setShowMobileMenu(false)} className="btn-secondary w-full py-3 text-lg">Sign In</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
