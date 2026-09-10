import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PostJob = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: 'internship',
    skills: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/jobs', formData);
      navigate('/company-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-dark mb-6">Post a New Job</h1>
      
      <div className="glass-panel p-8 rounded-lg shadow-lg">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Job Title</label>
            <input 
              type="text" 
              name="title"
              className="input-field" 
              value={formData.title} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea 
              name="description"
              className="input-field h-32" 
              value={formData.description} 
              onChange={handleChange} 
              required 
            ></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">Location</label>
              <input 
                type="text" 
                name="location"
                className="input-field" 
                value={formData.location} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Job Type</label>
              <select 
                name="type"
                className="input-field" 
                value={formData.type} 
                onChange={handleChange}
              >
                <option value="internship">Internship</option>
                <option value="full-time">Full-time</option>
              </select>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Required Skills (comma separated)</label>
            <input 
              type="text" 
              name="skills"
              className="input-field" 
              value={formData.skills} 
              onChange={handleChange} 
              placeholder="e.g. React, Node.js, MongoDB"
            />
          </div>
          <button type="submit" className="btn-primary w-full">Post Job</button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
