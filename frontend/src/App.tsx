import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages';
import ComponentName from './components';
import './styles/index.css';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Add more routes here as needed */}
        </Routes>
        <ComponentName />
      </div>
    </Router>
  );
};

export default App;