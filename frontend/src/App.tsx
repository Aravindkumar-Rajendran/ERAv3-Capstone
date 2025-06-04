import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WizardPage } from './pages/WizardPage';
import { InteractivePage } from './pages/InteractivePage';
import './styles/index.css';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<WizardPage />} />
          <Route path="/old-demo" element={<InteractivePage />} />
          {/* Add more routes here as needed */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;