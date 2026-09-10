import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ApplicationForm from '../components/ApplicationForm';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/jobs/${id}`);
        setJob(res.data);
      } catch (err) {
        console.error('Error fetching job details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApplySuccess = () => {
    setShowApplyModal(false);
    navigate('/my-applications');
  };

  if (loading) return <div>Loading job details...</div>;
  if (!job) return <div>Job not found</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="glass-panel p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-dark mb-2">{job.title}</h1>
        <h2 className="text-2xl text-primary mb-4">{job.company?.companyName}</h2>
        
        <div className="flex flex-wrap gap-4 mb-6 text-gray-600">
          <span className="flex items-center"><span className="font-semibold mr-2">Location:</span> {job.location}</span>
          <span className="flex items-center"><span className="font-semibold mr-2">Type:</span> {job.type}</span>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, index) => (
              <span key={index} className="bg-gray-200 text-sm px-3 py-1 rounded-full">{skill}</span>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold mb-2">Job Description</h3>
          <div className="text-gray-700 whitespace-pre-wrap">{job.description}</div>
        </div>

        <button 
          onClick={() => setShowApplyModal(true)} 
          className="btn-primary w-full text-lg py-3"
        >
          Apply Now
        </button>
      </div>

      {showApplyModal && (
        <ApplicationForm 
          jobId={job._id} 
          onClose={() => setShowApplyModal(false)}
          onSuccess={handleApplySuccess}
        />
      )}
    </div>
  );
};

export default JobDetail;
