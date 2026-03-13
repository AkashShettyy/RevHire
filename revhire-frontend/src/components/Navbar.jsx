import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav>
      {/* Logo */}
      <Link
        to={user?.role === "employer" ? "/employer/dashboard" : "/dashboard"}
      >
        <h2>RevHire</h2>
      </Link>

      <div>
        {user ? (
          <>
            {/* Job Seeker Links */}
            {user.role === "jobseeker" && (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/jobs">Find Jobs</Link>
                <Link to="/applications">My Applications</Link>
                <Link to="/resume">My Resume</Link>
              </>
            )}

            {/* Employer Links */}
            {user.role === "employer" && (
              <>
                <Link to="/employer/dashboard">Dashboard</Link>
                <Link to="/employer/post-job">Post a Job</Link>
              </>
            )}

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
