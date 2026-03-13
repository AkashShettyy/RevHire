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

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          to={user?.role === "employer" ? "/employer/dashboard" : "/dashboard"}
          className="text-2xl font-bold tracking-tight text-slate-900"
        >
          RevHire
        </Link>

        <div className="flex items-center gap-4 md:gap-6">
          {user ? (
            <>
              {user.role === "jobseeker" && (
                <>
                  {!isJobSeekerDashboard && (
                    <Link
                      to="/dashboard"
                      className="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
                    >
                      Dashboard
                    </Link>
                  )}
                  <Link
                    to="/jobs"
                    className="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
                  >
                    Find Jobs
                  </Link>
                  <Link
                    to="/applications"
                    className="hidden text-sm font-medium text-slate-600 transition-colors hover:text-primary sm:inline"
                  >
                    Applications
                  </Link>
                  <Link
                    to="/resume"
                    className="hidden text-sm font-medium text-slate-600 transition-colors hover:text-primary sm:inline"
                  >
                    Resume
                  </Link>
                </>
              )}

              {user.role === "employer" && (
                <>
                  {!isEmployerDashboard && (
                    <Link
                      to="/employer/dashboard"
                      className="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
                    >
                      Dashboard
                    </Link>
                  )}
                  <Link
                    to="/employer/post-job"
                    className="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
                  >
                    Post a Job
                  </Link>
                </>
              )}

              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) fetchNotifications();
                  }}
                  className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-primary"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                      <p className="font-semibold text-slate-900">
                        Notifications
                      </p>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-primary hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-6">
                          No notifications
                        </p>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n._id}
                            className={`px-4 py-3 border-b border-slate-100 ${
                              n.status === "unread" ? "bg-blue-50" : ""
                            }`}
                          >
                            <p
                              className={`text-sm ${n.status === "unread" ? "font-semibold text-slate-900" : "text-slate-600"}`}
                            >
                              {n.message}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <span className="hidden text-slate-600 text-sm font-medium lg:inline">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-50 text-red-500 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-600 hover:text-primary"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
