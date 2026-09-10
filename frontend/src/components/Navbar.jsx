import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">InternTrack</Link>
        
        <div>
          {user ? (
            <div className="flex gap-4 items-center">
              {user.role === 'student' ? (
                <>
                  <Link to="/student-dashboard" className="text-gray-600 hover:text-primary">Dashboard</Link>
                  <Link to="/my-applications" className="text-gray-600 hover:text-primary">My Applications</Link>
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
