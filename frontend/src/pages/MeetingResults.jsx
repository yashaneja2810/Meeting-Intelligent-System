import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

export default function MeetingResults() {
  const { id: meetingId } = useParams();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState(null);
  const [mom, setMom] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMeetingData();
  }, [meetingId]);

  const fetchMeetingData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      // Fetch meeting details
      const meetingResponse = await api.get(`/live-meetings/${meetingId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setMeeting(meetingResponse);

      // Fetch MOM
      try {
        const momResponse = await api.get(`/live-meetings/${meetingId}/mom`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        setMom(momResponse);
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error('Error fetching MOM:', err);
        }
      }

      // Fetch transcript
      try {
        const transcriptResponse = await api.get(`/live-meetings/${meetingId}/transcript`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        setTranscript(transcriptResponse.fullText || '');
      } catch (err) {
        console.error('Error fetching transcript:', err);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching meeting data:', error);
      setError('Failed to load meeting results');
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const downloadTranscript = () => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-transcript-${meetingId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadMOM = () => {
    if (!mom) return;

    const content = `
MINUTES OF MEETING
==================

Meeting: ${mom.meeting_title}
Date: ${formatDate(mom.meeting_date)}
Duration: ${formatDuration(mom.duration_minutes)}
Participants: ${mom.participants?.join(', ') || 'N/A'}

SUMMARY
-------
${mom.summary}

KEY POINTS
----------
${mom.key_points?.map((p, i) => `${i + 1}. ${p}`).join('\n') || 'None'}

DECISIONS MADE
--------------
${mom.decisions?.map((d, i) => `${i + 1}. ${d}`).join('\n') || 'None'}

ACTION ITEMS
------------
${mom.action_items?.map((a, i) => `${i + 1}. ${a}`).join('\n') || 'None'}

TOPICS DISCUSSED
----------------
${mom.topics?.join(', ') || 'None'}

SENTIMENT
---------
${mom.sentiment || 'Neutral'}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-minutes-${meetingId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#444444] border-t-black rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading meeting results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-100 mb-2">{error}</h2>
          <button
            onClick={() => navigate('/live-meetings')}
            className="mt-4 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            Back to Meetings
          </button>
        </div>
      </div>
    );
  }

  const sentimentColors = {
    positive: 'bg-green-100 text-green-800',
    neutral: 'bg-[#1A1A1A] text-gray-200',
    negative: 'bg-red-100 text-red-800'
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-6 px-4 sm:py-8">
      <div className="max-w-5xl mx-auto">
        <style>{`
          @media (max-width: 640px) {
            .mr-actions { flex-direction: column; }
            .mr-actions button { width: 100%; }
          }
        `}</style>
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/live-meetings')}
            className="text-gray-400 hover:text-gray-100 mb-4 flex items-center gap-2"
          >
            ← Back to Meetings
          </button>
          <h1 className="text-3xl font-bold text-gray-100">{meeting?.title}</h1>
          <p className="text-gray-400 mt-2">
            {formatDate(meeting?.started_at)} • {formatDuration(meeting?.duration_minutes)}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#111111] rounded-lg shadow-sm border border-[#333333] p-4">
            <div className="text-2xl mb-1">👥</div>
            <div className="text-2xl font-bold text-gray-100">
              {meeting?.participants?.length || 0}
            </div>
            <div className="text-sm text-gray-400">Participants</div>
          </div>

          <div className="bg-[#111111] rounded-lg shadow-sm border border-[#333333] p-4">
            <div className="text-2xl mb-1">⏱️</div>
            <div className="text-2xl font-bold text-gray-100">
              {formatDuration(meeting?.duration_minutes)}
            </div>
            <div className="text-sm text-gray-400">Duration</div>
          </div>

          <div className="bg-[#111111] rounded-lg shadow-sm border border-[#333333] p-4">
            <div className="text-2xl mb-1">📝</div>
            <div className="text-2xl font-bold text-gray-100">
              {transcript?.split('\n').length || 0}
            </div>
            <div className="text-sm text-gray-400">Transcript Lines</div>
          </div>

          <div className="bg-[#111111] rounded-lg shadow-sm border border-[#333333] p-4">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-2xl font-bold text-gray-100">
              {meeting?.processed ? 'Yes' : 'Processing...'}
            </div>
            <div className="text-sm text-gray-400">Tasks Extracted</div>
          </div>
        </div>

        {/* Minutes of Meeting */}
        {mom ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111111] rounded-lg shadow-sm border border-[#333333] p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-100">Minutes of Meeting</h2>
              <button
                onClick={downloadMOM}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Download MOM
              </button>
            </div>

            {/* Summary */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Summary</h3>
              <p className="text-gray-300 leading-relaxed">{mom.summary}</p>
            </div>

            {/* Sentiment */}
            {mom.sentiment && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-2">Overall Sentiment</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${sentimentColors[mom.sentiment]}`}>
                  {mom.sentiment.charAt(0).toUpperCase() + mom.sentiment.slice(1)}
                </span>
              </div>
            )}

            {/* Participants */}
            {mom.participants && mom.participants.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-2">Participants</h3>
                <div className="flex flex-wrap gap-2">
                  {mom.participants.map((participant, index) => (
                    <span key={index} className="bg-[#1A1A1A] text-gray-300 px-3 py-1 rounded-full text-sm">
                      {participant}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Key Points */}
            {mom.key_points && mom.key_points.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-2">Key Points</h3>
                <ul className="space-y-2">
                  {mom.key_points.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span className="text-gray-300">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Decisions */}
            {mom.decisions && mom.decisions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-2">Decisions Made</h3>
                <ul className="space-y-2">
                  {mom.decisions.map((decision, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span className="text-gray-300">{decision}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Items */}
            {mom.action_items && mom.action_items.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-2">Action Items</h3>
                <ul className="space-y-2">
                  {mom.action_items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-600 mt-1">→</span>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Topics */}
            {mom.topics && mom.topics.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">Topics Discussed</h3>
                <div className="flex flex-wrap gap-2">
                  {mom.topics.map((topic, index) => (
                    <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <p className="text-yellow-800">
              ⏳ Minutes of Meeting are being generated. Please refresh in a few moments.
            </p>
          </div>
        )}

        {/* Transcript */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111111] rounded-lg shadow-sm border border-[#333333] p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-100">Full Transcript</h2>
              <button
                onClick={downloadTranscript}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Download Transcript
              </button>
            </div>
            <div className="bg-[#0A0A0A] rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                {transcript}
              </pre>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3 flex-wrap mr-actions">
          {meeting?.processed && (
            <button
              onClick={() => navigate('/tasks')}
              className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              View Extracted Tasks
            </button>
          )}
          
          <button
            onClick={() => navigate('/live-meetings')}
            className="px-6 py-3 border border-[#444444] text-gray-300 rounded-lg hover:bg-[#0A0A0A] transition-colors font-medium"
          >
            Back to Meetings
          </button>
        </div>
      </div>
    </div>
  );
}
