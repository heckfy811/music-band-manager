import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GroupList from './pages/GroupList';
import GroupDetail from './pages/GroupDetail';
import TourManager from './pages/TourManager';
import NavBar from './components/NavBar';

function App() {
  return (
    <Router>
      <NavBar />
      <div className="container mx-auto px-4">
        <Routes>
          <Route path="/" element={<GroupList />} />
          <Route path="/group/:id" element={<GroupDetail />} />
          <Route path="/tours" element={<TourManager />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;