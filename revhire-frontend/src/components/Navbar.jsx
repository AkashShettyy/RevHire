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

  useEffect(() => {
    if (user && token) fetchNotifications();
  }, [user]);

  useEffect(() => {
    setShowNotifications(false);
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

  const navLink = "text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors duration-200";

  return (
    <nav className="sticky top-0 z-50 border-b border-white/60 bg-white/75 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          to={user ? (user.role === "employer" ? "/employer/dashboard" : "/dashboard") : "/"}
          className="inline-flex items-center gap-3 text-slate-950"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-500 to-slate-900 text-sm font-bold text-white shadow-lg shadow-cyan-500/20">
            RH
          </span>
          <span className="font-['Space_Grotesk'] text-xl font-bold tracking-tight">RevHire</span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          {user ? (
            <>
              {user.role === "jobseeker" && (
                <>
                  {!isJobSeekerDashboard && <Link to="/dashboard" className={navLink}>Dashboard</Link>}
                  <Link to="/jobs" className={navLink}>Find Jobs</Link>
                  <Link to="/applications" className="hidden sm:inline text-sm font-medium text-slate-600 hover:text-cyan-700 transition-colors">Applications</Link>
                  <Link to="/resume" className="hidden sm:inline text-sm font-medium text-slate-600 hover:text-cyan-700 transition-colors">Resume</Link>
                </>
              )}
              {user.role === "employer" && (
                <>
                  {!isEmployerDashboard && <Link to="/employer/dashboard" className={navLink}>Dashboard</Link>}
                  <Link to="/employer/post-job" className={navLink}>Post a Job</Link>
                </>
              )}
              <Link to="/settings" className="hidden sm:inline text-sm font-medium text-slate-600 hover:text-cyan-700 transition-colors">
                Settings
              </Link>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) fetchNotifications(); }}
                  className="relative rounded-xl p-2 text-slate-500 transition-colors hover:bg-cyan-50 hover:text-cyan-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-600 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 z-50 w-80 overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                      <p className="font-semibold text-slate-900 text-sm">Notifications</p>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-xs text-indigo-600 hover:underline font-medium">
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
                          <div key={n._id} className={`px-4 py-3 border-b border-slate-50 last:border-0 ${n.status === "unread" ? "bg-cyan-50/70" : ""}`}>
                            <p className={`text-sm ${n.status === "unread" ? "font-semibold text-slate-900" : "text-slate-600"}`}>{n.message}</p>
                            <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden lg:flex items-center gap-2 border-l border-slate-200 pl-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-700">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-700">{user.name}</span>
              </div>

              <button
                onClick={handleLogout}
                className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={navLink}>Sign In</Link>
              <Link to="/register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
