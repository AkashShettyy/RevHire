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
    <nav>
      <Link
        to={user?.role === "employer" ? "/employer/dashboard" : "/dashboard"}
      >
        <h2>RevHire</h2>
      </Link>

      <div>
        {user ? (
          <>
            {user.role === "jobseeker" && (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/jobs">Find Jobs</Link>
                <Link to="/applications">My Applications</Link>
                <Link to="/resume">My Resume</Link>
              </>
            )}

            {user.role === "employer" && (
              <>
                <Link to="/employer/dashboard">Dashboard</Link>
                <Link to="/employer/post-job">Post a Job</Link>
              </>
            )}

            {/* Notification Bell */}
            <div>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) fetchNotifications();
                }}
              >
                🔔 {unreadCount > 0 && <span>({unreadCount})</span>}
              </button>

              {showNotifications && (
                <div>
                  <div>
                    <p>Notifications</p>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead}>Mark all read</button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p>No notifications</p>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div
                        key={n._id}
                        style={{
                          fontWeight: n.status === "unread" ? "bold" : "normal",
                        }}
                      >
                        <p>{n.message}</p>
                        <p>{new Date(n.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <span>| {user.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
