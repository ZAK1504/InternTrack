import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../hooks/useAuth';

const CompanyDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/jobs');
        // Filter jobs for this company
        const companyJobs = res.data.filter(job => job.company._id === user.userId);
        setJobs(companyJobs);
      } catch (err) {
        console.error('Error fetching jobs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [user]);

  if (loading) return <div>Loading jobs...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dark">Company Dashboard</h1>
        <Link to="/post-job" className="btn-primary">Post New Job</Link>
      </div>

      {jobs.length === 0 ? (
        <div className="glass-panel p-8 text-center text-gray-500 rounded">
          You haven't posted any jobs yet.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map(job => (
            <div key={job._id} className="glass-panel p-6 rounded-lg flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                <p className="text-gray-600 mb-2">{job.location} • {job.type}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.map((skill, index) => (
                    <span key={index} className="bg-gray-200 text-sm px-2 py-1 rounded">{skill}</span>
                  ))}
                </div>
              </div>
              <Link to={`/jobs/${job._id}/applicants`} className="btn-secondary text-center mt-4">
                View Applicants
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
