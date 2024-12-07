import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Page components (to be created)
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import ReviewerPage from './pages/ReviewerPage';
import ReviewResultsPage from './pages/ReviewResultsPage';
import NewProjectPage from './pages/NewProjectPage';

// Layout components (to be created)
import DashboardLayout from './layouts/DashboardLayout';

// Auth context (to be created)
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected Route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes with DashboardLayout */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
            <Route path="/projects/:projectId/reviewer" element={<ReviewerPage />} />
            <Route path="/projects/:projectId/results" element={<ReviewResultsPage />} />
            <Route path="/projects/new" element={<NewProjectPage />} />
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
