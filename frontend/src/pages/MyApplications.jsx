import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { SocketContext } from '../context/SocketContext';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useContext(SocketContext);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/applications/mine');
        setApplications(res.data);
      } catch (err) {
        console.error('Error fetching applications', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  // Listen for real-time status updates
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (data) => {
      // Find the application by jobTitle (or we could send appId from backend)
      // For simplicity, we just refetch the list when an update happens to keep it in sync
      // or we can update the state directly if we have the right identifiers.
      // Let's refetch to be safe and simple.
      const fetchApplications = async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/applications/mine');
          setApplications(res.data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchApplications();
    };

    socket.on('application:statusUpdated', handleStatusUpdate);

    return () => {
      socket.off('application:statusUpdated', handleStatusUpdate);
    };
  }, [socket]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'shortlisted': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  if (loading) return <div>Loading your applications...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-dark mb-6">My Applications</h1>

      {applications.length === 0 ? (
        <div className="glass-panel p-8 text-center text-gray-500 rounded">
          You haven't applied to any jobs yet.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {applications.map(app => (
            <div key={app._id} className="glass-panel p-6 rounded-lg flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-1">{app.job?.title}</h3>
                <p className="text-gray-600 mb-4">{app.job?.location} • {app.job?.type}</p>
                <div className="text-sm text-gray-500 mb-2">Applied on: {new Date(app.createdAt).toLocaleDateString()}</div>
                
                <div className={`mt-4 px-4 py-2 border rounded font-semibold inline-block ${getStatusColor(app.status)}`}>
                  Status: {app.status.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
