import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../hooks/useAuth';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    companyName: ''
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', formData);
      login(res.data.token, res.data);
      if (res.data.role === 'student') {
        navigate('/student-dashboard');
      } else {
        navigate('/company-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10">
      <div className="glass-panel p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-primary">InternTrack</h2>
        <h3 className="text-xl mb-4 text-center">Create an account</h3>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">I am a...</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="role" 
                  value="student" 
                  checked={formData.role === 'student'} 
                  onChange={handleChange} 
                  className="mr-2"
                /> Student
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="role" 
                  value="company" 
                  checked={formData.role === 'company'} 
                  onChange={handleChange} 
                  className="mr-2"
                /> Company
              </label>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Name</label>
            <input 
              type="text" 
              name="name"
              className="input-field" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>
          {formData.role === 'company' && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Company Name</label>
              <input 
                type="text" 
                name="companyName"
                className="input-field" 
                value={formData.companyName} 
                onChange={handleChange} 
                required 
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              name="email"
              className="input-field" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              name="password"
              className="input-field" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>
          <button type="submit" className="btn-primary w-full">Sign Up</button>
        </form>
        <p className="mt-4 text-center">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
