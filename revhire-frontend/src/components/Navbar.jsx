import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { getNotifications, markAllRead } from "../services/notificationService";

function Navbar() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user && token) fetchNotifications();
  }, [user]);

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

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          to={user?.role === "employer" ? "/employer/dashboard" : "/dashboard"}
          className="text-2xl font-bold text-primary"
        >
          RevHire
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          {user ? (
            <>
              {user.role === "jobseeker" && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-primary font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/jobs"
                    className="text-gray-600 hover:text-primary font-medium transition-colors"
                  >
                    Find Jobs
                  </Link>
                  <Link
                    to="/applications"
                    className="text-gray-600 hover:text-primary font-medium transition-colors"
                  >
                    Applications
                  </Link>
                  <Link
                    to="/resume"
                    className="text-gray-600 hover:text-primary font-medium transition-colors"
                  >
                    Resume
                  </Link>
                </>
              )}

              {user.role === "employer" && (
                <>
                  <Link
                    to="/employer/dashboard"
                    className="text-gray-600 hover:text-primary font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/employer/post-job"
                    className="text-gray-600 hover:text-primary font-medium transition-colors"
                  >
                    Post a Job
                  </Link>
                </>
              )}

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) fetchNotifications();
                  }}
                  className="relative p-2 text-gray-600 hover:text-primary transition-colors"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">
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
                        <p className="text-gray-500 text-sm text-center py-6">
                          No notifications
                        </p>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n._id}
                            className={`px-4 py-3 border-b border-gray-50 ${
                              n.status === "unread" ? "bg-blue-50" : ""
                            }`}
                          >
                            <p
                              className={`text-sm ${n.status === "unread" ? "font-semibold text-gray-900" : "text-gray-600"}`}
                            >
                              {n.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <span className="text-gray-600 text-sm font-medium">
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
                className="text-gray-600 hover:text-primary font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-secondary transition-colors"
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
