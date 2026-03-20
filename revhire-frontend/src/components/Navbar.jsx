import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { getNotifications, markAllRead } from "../services/notificationService";

function Navbar() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    if (user && token) fetchNotifications();
  }, [user]);

  useEffect(() => {
    setShowNotifications(false);
    setShowMobileMenu(false);
  }, [location.pathname]);

  async function fetchNotifications() {
    try {
      const data = await getNotifications(token);
      setNotifications(data.notifications);
    } catch (error) {
      console.error(error);
    }
  }

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
  const isJobSeekerDashboard = location.pathname === "/dashboard";
  const isEmployerDashboard = location.pathname === "/employer/dashboard";

  const navItems = user
    ? user.role === "jobseeker"
      ? [
          !isJobSeekerDashboard && { to: "/dashboard", label: "Dashboard" },
          { to: "/jobs", label: "Find Jobs" },
          { to: "/applications", label: "Applications" },
          { to: "/resume", label: "Resume" },
          { to: "/settings", label: "Settings" },
        ].filter(Boolean)
      : [
          !isEmployerDashboard && { to: "/employer/dashboard", label: "Dashboard" },
          { to: "/employer/post-job", label: "Post a Job" },
          { to: "/settings", label: "Settings" },
        ].filter(Boolean)
    : [];

  return (
    <nav className="sticky top-0 z-50 border-b border-blue-100 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          to={user ? (user.role === "employer" ? "/employer/dashboard" : "/dashboard") : "/"}
          className="inline-flex items-center gap-3 text-slate-950"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-sm font-bold text-white shadow-lg shadow-blue-500/20">
            RH
          </span>
          <span className="font-['Plus_Jakarta_Sans'] text-xl font-bold tracking-tight">RevHire</span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {user ? (
            <>
              {navItems.map((item) => (
                <Link key={item.to} to={item.to} className="nav-link">
                  {item.label}
                </Link>
              ))}

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) fetchNotifications(); }}
                  className="relative rounded-xl p-2 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                      <p className="font-semibold text-slate-900 text-sm">Notifications</p>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:underline font-medium">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center">
                          <p className="text-slate-400 text-sm">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.slice(0, 6).map((n) => (
                          <div key={n._id} className={`px-4 py-3 border-b border-slate-50 last:border-0 ${n.status === "unread" ? "bg-blue-50/80" : ""}`}>
                            <p className={`text-sm ${n.status === "unread" ? "font-semibold text-slate-900" : "text-slate-600"}`}>{n.message}</p>
                            <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.role === "employer" ? "Employer" : "Job Seeker"}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-red-200 hover:text-red-500"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Sign In</Link>
              <Link to="/register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {!user && <Link to="/login" className="text-sm font-medium text-slate-600">Sign In</Link>}
          <button
            type="button"
            onClick={() => setShowMobileMenu((current) => !current)}
            className="rounded-xl border border-slate-200 p-2 text-slate-600"
            aria-label="Toggle navigation menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showMobileMenu ? "M6 18L18 6M6 6l12 12" : "M4 7h16M4 12h16M4 17h16"} />
            </svg>
          </button>
        </div>
      </div>

      {showMobileMenu && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            {user ? (
              <div className="space-y-2">
                <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.role === "employer" ? "Employer" : "Job Seeker"}</p>
                </div>
                {navItems.map((item) => (
                  <Link key={item.to} to={item.to} className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700">
                    {item.label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:border-red-200 hover:text-red-500"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link to="/register" className="btn-primary w-full">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
