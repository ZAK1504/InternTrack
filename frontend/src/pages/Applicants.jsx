import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const recommendationConfig = {
  'Highly Recommended': { color: 'bg-green-100 text-green-800 border-green-300', badge: 'bg-green-500', border: 'border-green-500' },
  'Recommended':        { color: 'bg-blue-100 text-blue-800 border-blue-300',   badge: 'bg-blue-500',  border: 'border-blue-500' },
  'Neutral':            { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', badge: 'bg-yellow-500', border: 'border-yellow-500' },
  'Not Recommended':    { color: 'bg-red-100 text-red-800 border-red-300',      badge: 'bg-red-500',   border: 'border-red-500' },
};

const ScoreBadge = ({ score }) => {
  const color = score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600';
  const ring  = score >= 80 ? 'border-green-500' : score >= 50 ? 'border-yellow-500' : 'border-red-500';
  return (
    <div className={`w-16 h-16 rounded-full border-4 ${ring} flex flex-col items-center justify-center`}>
      <span className={`text-xl font-black leading-none ${color}`}>{score ?? '–'}</span>
      <span className="text-xs text-gray-400 leading-none">/100</span>
    </div>
  );
};

const ApplicantCard = ({ app, rank, isTopPick, onStatusChange, isRescoring, onRescore }) => {
  const [expanded, setExpanded] = useState(isTopPick);
  const rec = app.aiRecommendation || 'Neutral';
  const cfg = recommendationConfig[rec] || recommendationConfig['Neutral'];

  return (
    <div className={`bg-white rounded-xl shadow-md border-l-4 ${cfg.border} overflow-hidden transition-all duration-300`}>
      {/* Header */}
      <div className="p-5 flex items-start gap-4">
        {/* Rank badge */}
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
          #{rank}
        </div>

        {/* Name & info */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-gray-900">{app.student?.name}</h3>
            {isTopPick && (
              <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-full">
                ⭐ TOP PICK
              </span>
            )}
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${cfg.color}`}>
              {rec}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{app.student?.email}</p>
          {app.aiSummary && (
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{app.aiSummary}</p>
          )}
        </div>

        {/* Score circle or rescoring spinner */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          {isRescoring ? (
            <div className="w-16 h-16 rounded-full border-4 border-indigo-300 flex items-center justify-center animate-spin border-t-indigo-600">
            </div>
          ) : app.aiScore === null ? (
            <div className="flex flex-col items-center gap-1">
              <div className="w-16 h-16 rounded-full border-4 border-gray-200 flex items-center justify-center text-gray-400 text-xs text-center">
                No Score
              </div>
              <button
                onClick={onRescore}
                className="text-xs text-indigo-600 hover:underline font-medium"
              >
                🔄 Score Now
              </button>
            </div>
          ) : (
            <ScoreBadge score={app.aiScore} />
          )}
        </div>
      </div>

      {/* Expand/collapse toggle */}
      <div
        className="px-5 pb-2 flex items-center gap-2 cursor-pointer text-sm text-indigo-600 hover:text-indigo-800 font-medium select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <span>{expanded ? '▲ Hide Details' : '▼ Show Full Analysis'}</span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">

          {/* Pitch */}
          {app.pitch && (
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400 mb-1">Student's Pitch</p>
              <p className="text-sm text-gray-700 italic bg-gray-50 p-3 rounded border-l-2 border-gray-300">"{app.pitch}"</p>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          {(app.aiStrengths?.length > 0 || app.aiWeaknesses?.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {app.aiStrengths?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase text-green-600 mb-2">✓ Strengths</p>
                  <ul className="space-y-1">
                    {app.aiStrengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {app.aiWeaknesses?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase text-red-500 mb-2">✗ Concerns</p>
                  <ul className="space-y-1">
                    {app.aiWeaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* AI explanation */}
          {app.aiExplanation && (
            <div className="bg-blue-50 rounded p-3 border border-blue-100">
              <p className="text-xs font-semibold uppercase text-blue-600 mb-1">AI Detailed Assessment</p>
              <p className="text-sm text-gray-700 leading-relaxed">{app.aiExplanation}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 flex-wrap gap-3">
            <a
              href={`http://localhost:5000/${app.resumeUrl}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              📄 View Resume PDF
            </a>

            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                app.status === 'shortlisted' ? 'bg-green-100 text-green-700' :
                app.status === 'rejected'    ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {app.status?.toUpperCase()}
              </span>

              {app.status !== 'shortlisted' && (
                <button
                  onClick={() => onStatusChange(app._id, 'shortlisted')}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded shadow transition"
                >
                  ✓ Shortlist
                </button>
              )}
              {app.status !== 'rejected' && (
                <button
                  onClick={() => onStatusChange(app._id, 'rejected')}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded shadow transition"
                >
                  ✗ Reject
                </button>
              )}
              {app.status !== 'applied' && (
                <button
                  onClick={() => onStatusChange(app._id, 'applied')}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded shadow transition"
                >
                  ↩ Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Applicants = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rescoring, setRescoring] = useState({}); // tracks which apps are being rescored

  const sortApplicants = (apps) =>
    [...apps].sort((a, b) => {
      if (a.aiScore === null && b.aiScore === null) return 0;
      if (a.aiScore === null) return 1;
      if (b.aiScore === null) return -1;
      return b.aiScore - a.aiScore;
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, appRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/jobs/${id}`),
          axios.get(`http://localhost:5000/api/jobs/${id}/applicants`)
        ]);
        setJob(jobRes.data);
        const sorted = sortApplicants(appRes.data);
        setApplicants(sorted);

        // Auto-rescore any applications where AI scoring previously failed
        const unscored = appRes.data.filter(a => a.aiScore === null);
        if (unscored.length > 0) {
          setRescoring(Object.fromEntries(unscored.map(a => [a._id, true])));
          const rescored = await Promise.all(
            unscored.map(app =>
              axios.post(`http://localhost:5000/api/applications/${app._id}/rescore`)
                .then(r => r.data)
                .catch(() => app) // if it fails, keep original
            )
          );
          setApplicants(prev => {
            const updated = prev.map(app => {
              const fix = rescored.find(r => r._id === app._id);
              return fix || app;
            });
            return sortApplicants(updated);
          });
          setRescoring({});
        }
      } catch (err) {
        console.error('Error fetching data', err);
        setError('Could not load applicants. Are you logged in as the job owner?');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const rescore = async (applicationId) => {
    setRescoring(prev => ({ ...prev, [applicationId]: true }));
    try {
      const res = await axios.post(`http://localhost:5000/api/applications/${applicationId}/rescore`);
      setApplicants(prev => sortApplicants(prev.map(app => app._id === applicationId ? res.data : app)));
    } catch (err) {
      console.error('Rescore failed', err);
    } finally {
      setRescoring(prev => ({ ...prev, [applicationId]: false }));
    }
  };


  const updateStatus = async (applicationId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/applications/${applicationId}/status`, { status: newStatus });
      setApplicants(prev =>
        prev.map(app => app._id === applicationId ? { ...app, status: newStatus } : app)
      );
    } catch (err) {
      console.error('Error updating status', err);
      alert('Failed to update status. Please try again.');
    }
  };


  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-gray-400 animate-pulse text-lg">Loading applicants...</div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 text-center">{error}</div>
  );

  const shortlisted = applicants.filter(a => a.status === 'shortlisted').length;
  const rejected    = applicants.filter(a => a.status === 'rejected').length;
  const pending     = applicants.length - shortlisted - rejected;

  const chartData = {
    labels: ['Shortlisted', 'Rejected', 'Pending'],
    datasets: [
      {
        data: [shortlisted, rejected, pending],
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page header and Chart */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-white p-6 rounded-xl shadow">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Applicants Dashboard</h1>
          <p className="text-gray-500 text-lg mb-4">{job?.title}</p>

          {/* Stats row */}
          <div className="flex gap-4 flex-wrap">
            {[
              { label: 'Total',       value: applicants.length, color: 'bg-gray-100 text-gray-700' },
              { label: 'Shortlisted', value: shortlisted,        color: 'bg-green-100 text-green-700' },
              { label: 'Rejected',    value: rejected,           color: 'bg-red-100 text-red-700' },
              { label: 'Pending',     value: pending, color: 'bg-yellow-100 text-yellow-700' },
            ].map(s => (
              <div key={s.label} className={`px-4 py-2 rounded-full text-sm font-semibold ${s.color}`}>
                {s.label}: {s.value}
              </div>
            ))}
          </div>
        </div>
        
        {/* Chart.js Integration for Module 5 Syllabus */}
        {applicants.length > 0 && (
          <div className="h-40 flex justify-center">
            <Pie data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
          </div>
        )}
      </div>

      {/* AI note */}
      <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-700">
        <strong>AI-Ranked List</strong> — Candidates are ordered by AI score, with the top pick highlighted.
        The final decision is always yours — use the Shortlist / Reject buttons on each card.
      </div>

      {applicants.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400 text-lg">
          No applications yet for this job.
        </div>
      ) : (
        <div className="space-y-4">
          {applicants.map((app, index) => (
            <ApplicantCard
              key={app._id}
              app={app}
              rank={index + 1}
              isTopPick={index === 0}
              onStatusChange={updateStatus}
              isRescoring={!!rescoring[app._id]}
              onRescore={() => rescore(app._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Applicants;
