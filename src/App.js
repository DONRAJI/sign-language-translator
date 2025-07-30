import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from './pages/SplashScreen';
import MainPage from './pages/MainPage';
import FeaturePage from './pages/FeaturePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/feature" element={<FeaturePage />} />
      </Routes>
    </Router>
  );
}

export default App;
