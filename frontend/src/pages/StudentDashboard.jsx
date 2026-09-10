import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const StudentDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');

  const fetchJobs = async () => {
    try {
      let url = `http://localhost:5000/api/jobs?`;
      if (search) url += `search=${search}&`;
      if (location) url += `location=${location}&`;
      if (type) url += `type=${type}&`;

      const res = await axios.get(url);
      setJobs(res.data);
    } catch (err) {
      console.error('Error fetching jobs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchJobs();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-dark mb-6">Find Your Next Internship</h1>

      <div className="glass-panel p-4 mb-8 rounded-lg">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Search by title or skill..." 
            className="input-field md:w-1/3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Location..." 
            className="input-field md:w-1/4"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <select 
            className="input-field md:w-1/4"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="internship">Internship</option>
            <option value="full-time">Full-time</option>
          </select>
          <button type="submit" className="btn-primary md:w-auto">Search</button>
        </form>
      </div>

      {loading ? (
        <div>Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">No jobs found matching your criteria.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map(job => (
            <div key={job._id} className="glass-panel p-6 rounded-lg flex flex-col justify-between hover:shadow-2xl transition">
              <div>
                <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                <p className="text-sm font-semibold text-primary mb-2">{job.company?.companyName}</p>
                <p className="text-gray-600 mb-2">{job.location} • {job.type}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.map((skill, index) => (
                    <span key={index} className="bg-gray-200 text-sm px-2 py-1 rounded">{skill}</span>
                  ))}
                </div>
              </div>
              <Link to={`/jobs/${job._id}`} className="btn-secondary text-center mt-4">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
