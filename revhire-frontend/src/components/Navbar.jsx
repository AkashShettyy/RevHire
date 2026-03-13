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
      <Link to="/">
        <h2>RevHire</h2>
      </Link>

      <div>
        {user ? (
          <>
            <span>Hello, {user.name}</span>
            {user.role === "jobseeker" && (
              <>
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
