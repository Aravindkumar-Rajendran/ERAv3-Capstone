import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { AppLayout } from './components/layout';
import { LoginPage } from './pages/LoginPage';
import { WhizardPage } from './pages/WhizardPage';
import { InteractivePage } from './pages/InteractivePage';
import ProjectsPage from './pages/ProjectsPage';
import { theme } from './theme';
import './styles/index.css';

const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if we're on the login page
  const isLoginPage = window.location.pathname === '/login';
  
  // If we're on the login page, don't use the AppLayout
  if (isLoginPage) {
    return <>{children}</>;
  }
  
  // Otherwise, wrap with AppLayout
  return <AppLayout>{children}</AppLayout>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <LayoutWrapper>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected routes */}
              <Route
                path="/projects"
                element={
                  <PrivateRoute>
                    <ProjectsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/whizard"
                element={
                  <PrivateRoute>
                    <WhizardPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/interactive"
                element={
                  <PrivateRoute>
                    <InteractivePage />
                  </PrivateRoute>
                }
              />
              
              {/* Redirect root to projects */}
              <Route path="/" element={<Navigate to="/projects" replace />} />
              
              {/* Catch all route - redirect to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </LayoutWrapper>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;