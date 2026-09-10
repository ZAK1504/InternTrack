import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';

import StudentDashboard from './pages/StudentDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import PostJob from './pages/PostJob';
import Applicants from './pages/Applicants';
import JobDetail from './pages/JobDetail';
import MyApplications from './pages/MyApplications';

// Simple Toast Component
import { useState, useEffect, useContext } from 'react';
import { SocketContext } from './context/SocketContext';

const ToastManager = () => {
  const [toast, setToast] = useState(null);
  const socket = useContext(SocketContext);

  useEffect(() => {
    if (!socket) return;
    const handleStatus = (data) => {
      setToast(`Your application to ${data.jobTitle} was ${data.newStatus}!`);
      setTimeout(() => setToast(null), 5000);
    };
    socket.on('application:statusUpdated', handleStatus);
    return () => socket.off('application:statusUpdated', handleStatus);
  }, [socket]);

  if (!toast) return null;
  return (
    <div className="fixed bottom-4 right-4 bg-primary text-white px-6 py-3 rounded shadow-xl z-50 animate-bounce">
      {toast}
    </div>
  );
};

function App() {
  return (
    <Router>
      <ToastManager />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Student Routes */}
            <Route path="/student-dashboard" element={<ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/jobs/:id" element={<ProtectedRoute allowedRole="student"><JobDetail /></ProtectedRoute>} />
            <Route path="/my-applications" element={<ProtectedRoute allowedRole="student"><MyApplications /></ProtectedRoute>} />

            {/* Company Routes */}
            <Route path="/company-dashboard" element={<ProtectedRoute allowedRole="company"><CompanyDashboard /></ProtectedRoute>} />
            <Route path="/post-job" element={<ProtectedRoute allowedRole="company"><PostJob /></ProtectedRoute>} />
            <Route path="/jobs/:id/applicants" element={<ProtectedRoute allowedRole="company"><Applicants /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
