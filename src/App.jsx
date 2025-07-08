import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/parent" element={<ParentDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;