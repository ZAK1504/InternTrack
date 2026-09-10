import { useState } from 'react';
import axios from 'axios';

const ApplicationForm = ({ jobId, onClose, onSuccess }) => {
  const [pitch, setPitch] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a resume (PDF)');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('jobId', jobId);
    formData.append('pitch', pitch);
    formData.append('resume', file);

    try {
      await axios.post('http://localhost:5000/api/applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Application failed');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black font-bold text-xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6">Apply for this Job</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Resume (PDF only)</label>
            <input 
              type="file" 
              accept=".pdf"
              className="input-field p-1" 
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Pitch / Cover Note (Optional)</label>
            <textarea 
              className="input-field h-32"
              placeholder="Why are you a good fit?"
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
            ></textarea>
          </div>
          <button 
            type="submit" 
            className="btn-primary w-full disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;
