import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import JobSearch from "./pages/JobSearch";
import JobDetails from "./pages/JobDetails";
import ApplicationHistory from "./pages/ApplicationHistory";
import ResumeBuilder from "./pages/ResumeBuilder";
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import PostJob from "./pages/employer/PostJob";
import Applicants from "./pages/employer/Applicants";
import JobSeekerDashboard from "./pages/JobSeekerDashboard";

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return children;
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <JobSearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/:id"
              element={
                <ProtectedRoute>
                  <JobDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute role="jobseeker">
                  <ApplicationHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume"
              element={
                <ProtectedRoute role="jobseeker">
                  <ResumeBuilder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute role="jobseeker">
                  <JobSeekerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/dashboard"
              element={
                <ProtectedRoute role="employer">
                  <EmployerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/post-job"
              element={
                <ProtectedRoute role="employer">
                  <PostJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/applicants/:jobId"
              element={
                <ProtectedRoute role="employer">
                  <Applicants />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
