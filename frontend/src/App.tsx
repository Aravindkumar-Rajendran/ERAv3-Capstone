import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { LoginPage } from './pages/LoginPage';
import { WhizardPage } from './pages/WhizardPage';
import { InteractivePage } from './pages/InteractivePage';
import ProjectsPage from './pages/ProjectsPage';
import './styles/index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
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
      </AuthProvider>
    </Router>
  );
}

export default App;