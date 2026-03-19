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
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          to={user ? (user.role === "employer" ? "/employer/dashboard" : "/dashboard") : "/"}
          className="text-xl font-extrabold text-indigo-600 tracking-tight"
        >
          RevHire
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              {user.role === "jobseeker" && (
                <>
                  {!isJobSeekerDashboard && <Link to="/dashboard" className={navLink}>Dashboard</Link>}
                  <Link to="/jobs" className={navLink}>Find Jobs</Link>
                  <Link to="/applications" className="hidden sm:inline text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Applications</Link>
                  <Link to="/resume" className="hidden sm:inline text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Resume</Link>
                </>
              )}
              {user.role === "employer" && (
                <>
                  {!isEmployerDashboard && <Link to="/employer/dashboard" className={navLink}>Dashboard</Link>}
                  <Link to="/employer/post-job" className={navLink}>Post a Job</Link>
                </>
              )}

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) fetchNotifications(); }}
                  className="relative p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 card shadow-xl z-50 overflow-hidden">
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
                          <div key={n._id} className={`px-4 py-3 border-b border-slate-50 last:border-0 ${n.status === "unread" ? "bg-indigo-50/50" : ""}`}>
                            <p className={`text-sm ${n.status === "unread" ? "font-semibold text-slate-900" : "text-slate-600"}`}>{n.message}</p>
                            <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
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
