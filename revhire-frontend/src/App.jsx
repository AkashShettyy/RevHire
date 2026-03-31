import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import JobSearch from "./pages/JobSearch";
import JobDetails from "./pages/JobDetails";
import ApplicationHistory from "./pages/ApplicationHistory";
import ResumeBuilder from "./pages/ResumeBuilder";
import SavedJobs from "./pages/SavedJobs";
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import PostJob from "./pages/employer/PostJob";
import Applicants from "./pages/employer/Applicants";
import JobSeekerDashboard from "./pages/JobSeekerDashboard";
import AccountSettings from "./pages/AccountSettings";
import Notifications from "./pages/Notifications";
import InterviewCalendar from "./pages/InterviewCalendar";

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return children;
}

function Layout({ children }) {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="min-h-screen w-full relative">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[520px] bg-gradient-to-b from-brand-100/50 via-white/0 to-transparent" />
      <div className="pointer-events-none fixed left-[-12rem] top-[-10rem] z-0 h-[28rem] w-[28rem] rounded-full bg-brand-300/15 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-[-10rem] right-[-8rem] z-0 h-[24rem] w-[24rem] rounded-full bg-cyan-300/15 blur-[120px]" />
      {!isAuthPage && <Navbar />}
      <main className={isAuthPage ? "relative z-10 w-full" : "relative z-10 w-full pt-24 pb-12"}>
        {children}
      </main>
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
              path="/saved-jobs"
              element={
                <ProtectedRoute role="jobseeker">
                  <SavedJobs />
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
              path="/settings"
              element={
                <ProtectedRoute>
                  <AccountSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interviews"
              element={
                <ProtectedRoute>
                  <InterviewCalendar />
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
