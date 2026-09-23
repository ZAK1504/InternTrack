import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { SocketContext } from '../context/SocketContext';
import axios from 'axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const socket = useContext(SocketContext);

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch notifications on load for students
  useEffect(() => {
    if (user && user.role === 'student') {
      axios.get('http://localhost:5000/api/users/notifications')
        .then(res => setNotifications(res.data))
        .catch(err => console.error('Failed to fetch notifications', err));
    }
  }, [user]);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket || !user || user.role !== 'student') return;

    const handleNewNotification = (data) => {
      // Add the new notification to the top of the list
      setNotifications(prev => [
        { message: data.message, createdAt: new Date().toISOString(), _id: Date.now() },
        ...prev
      ]);
    };

    socket.on('application:statusUpdated', handleNewNotification);

    return () => {
      socket.off('application:statusUpdated', handleNewNotification);
    };
  }, [socket, user]);

  const handleClearNotifications = async () => {
    try {
      await axios.delete('http://localhost:5000/api/users/notifications');
      setNotifications([]);
      setShowDropdown(false);
    } catch (err) {
      console.error('Failed to clear notifications', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md p-4 relative z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">InternTrack</Link>
        
        <div>
          {user ? (
            <div className="flex gap-4 items-center">
              {user.role === 'student' ? (
                <>
                  <Link to="/student-dashboard" className="text-gray-600 hover:text-primary">Dashboard</Link>
                  <Link to="/my-applications" className="text-gray-600 hover:text-primary">My Applications</Link>
                  
                  {/* Notification Bell */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="text-gray-600 hover:text-primary relative focus:outline-none flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                          {notifications.length}
                        </span>
                      )}
                    </button>

                    {/* Notification Dropdown */}
                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg overflow-hidden border border-gray-200">
                        <div className="p-3 bg-gray-50 flex justify-between items-center border-b border-gray-200">
                          <span className="font-semibold text-gray-700">Notifications</span>
                          {notifications.length > 0 && (
                            <button onClick={handleClearNotifications} className="text-xs text-red-500 hover:text-red-700">Clear All</button>
                          )}
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">No new notifications</div>
                          ) : (
                            notifications.map((notif, idx) => (
                              <div key={notif._id || idx} className="p-3 border-b border-gray-100 hover:bg-gray-50 text-sm text-gray-700">
                                {notif.message}
                                <div className="text-xs text-gray-400 mt-1">
                                  {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString()}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/company-dashboard" className="text-gray-600 hover:text-primary">Dashboard</Link>
                  <Link to="/post-job" className="text-gray-600 hover:text-primary">Post Job</Link>
                </>
              )}
              <button onClick={handleLogout} className="btn-secondary ml-4">Logout</button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="text-gray-600 hover:text-primary mt-2">Login</Link>
              <Link to="/signup" className="btn-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
