import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

export default function LiveMeetings() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState({ own: [], participating: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, scheduled, active, ended

  useEffect(() => {
    fetchMeetings();
  }, [filter]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      let url = '/live-meetings';
      if (filter !== 'all') {
        url += `?status=${filter}`;
      }

      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      // Backend returns { ownMeetings, participatingMeetings } directly
      setMeetings({
        own: response.ownMeetings || [],
        participating: response.participatingMeetings || []
      });
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setMeetings({ own: [], participating: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = () => {
    navigate('/live-meetings/create');
  };

  const handleJoinMeeting = (meetingId) => {
    navigate(`/live-meetings/${meetingId}`);
  };

  const handleViewResults = (meetingId) => {
    navigate(`/live-meetings/${meetingId}/results`);
  };

  const handleDeleteMeeting = async (meetingId, meetingTitle) => {
    if (!confirm(`Are you sure you want to delete "${meetingTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      await api.delete(`/live-meetings/${meetingId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      
      // Refresh meetings list
      fetchMeetings();
    } catch (error) {
      console.error('Error deleting meeting:', error);
      alert('Failed to delete meeting. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      ended: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      scheduled: '📅',
      active: '🔴',
      ended: '✅',
      cancelled: '❌'
    };
    return icons[status] || '📅';
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const MeetingCard = ({ meeting, isOwn = false }) => {
    const isActive = meeting.status === 'active';
    const isEnded = meeting.status === 'ended';
    const isScheduled = meeting.status === 'scheduled';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {meeting.title}
            </h3>
            {meeting.description && (
              <p className="text-sm text-gray-600 mb-2">
                {meeting.description}
              </p>
            )}
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
            {getStatusIcon(meeting.status)} {meeting.status}
          </div>
        </div>

        {/* Meeting Info */}
        <div className="space-y-2 mb-4 text-sm text-gray-600">
          {meeting.scheduled_at && (
            <div className="flex items-center">
              <span className="mr-2">🕐</span>
              <span>Scheduled: {formatDateTime(meeting.scheduled_at)}</span>
            </div>
          )}
          
          {meeting.started_at && (
            <div className="flex items-center">
              <span className="mr-2">▶️</span>
              <span>Started: {formatDateTime(meeting.started_at)}</span>
            </div>
          )}
          
          {meeting.ended_at && (
            <div className="flex items-center">
              <span className="mr-2">⏸️</span>
              <span>Ended: {formatDateTime(meeting.ended_at)}</span>
            </div>
          )}

          {meeting.duration_minutes && (
            <div className="flex items-center">
              <span className="mr-2">⏱️</span>
              <span>Duration: {meeting.duration_minutes} minutes</span>
            </div>
          )}

          <div className="flex items-center">
            <span className="mr-2">👥</span>
            <span>{meeting.participants?.length || 0} participants</span>
          </div>

          {meeting.transcript_language && (
            <div className="flex items-center">
              <span className="mr-2">🌐</span>
              <span>Language: {meeting.transcript_language.toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isActive && (
            <button
              onClick={() => handleJoinMeeting(meeting.id)}
              className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Join Meeting
            </button>
          )}

          {isScheduled && isOwn && (
            <button
              onClick={() => handleJoinMeeting(meeting.id)}
              className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Start Meeting
            </button>
          )}

          {isScheduled && !isOwn && (
            <button
              disabled
              className="flex-1 bg-gray-100 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed font-medium"
            >
              Waiting to Start
            </button>
          )}

          {isEnded && (
            <>
              <button
                onClick={() => handleViewResults(meeting.id)}
                className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                View Summary
              </button>
              
              {meeting.processed && (
                <button
                  onClick={() => navigate('/tasks')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  View Tasks
                </button>
              )}
            </>
          )}

          {/* Delete button for own meetings */}
          {isOwn && (
            <button
              onClick={() => handleDeleteMeeting(meeting.id, meeting.title)}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
              title="Delete Meeting"
            >
              🗑️
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-gray-300 border-t-black rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading meetings...</p>
        </div>
      </div>
    );
  }

  const allMeetings = [...meetings.own, ...meetings.participating];
  const filteredMeetings = allMeetings.filter(m => 
    filter === 'all' || m.status === filter
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Live Meetings
            </h1>
            <p className="text-gray-600">
              Create and join interactive video meetings with your team
            </p>
          </div>
          
          <button
            onClick={handleCreateMeeting}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Create Meeting
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          {['all', 'scheduled', 'active', 'ended'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl mb-1">📅</div>
            <div className="text-2xl font-bold text-gray-900">
              {meetings.own.filter(m => m.status === 'scheduled').length}
            </div>
            <div className="text-sm text-gray-600">Scheduled</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl mb-1">🔴</div>
            <div className="text-2xl font-bold text-gray-900">
              {allMeetings.filter(m => m.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active Now</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-2xl font-bold text-gray-900">
              {allMeetings.filter(m => m.status === 'ended').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>

        {/* Meetings Grid */}
        {filteredMeetings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📹</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No meetings found
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? 'Create your first meeting to get started'
                : `No ${filter} meetings at the moment`}
            </p>
            <button
              onClick={handleCreateMeeting}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium inline-flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Create Meeting
            </button>
          </div>
        ) : (
          <>
            {/* Own Meetings */}
            {meetings.own.filter(m => filter === 'all' || m.status === filter).length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  My Meetings ({meetings.own.filter(m => filter === 'all' || m.status === filter).length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {meetings.own
                    .filter(m => filter === 'all' || m.status === filter)
                    .map((meeting) => (
                      <MeetingCard key={meeting.id} meeting={meeting} isOwn={true} />
                    ))}
                </div>
              </div>
            )}

            {/* Participating Meetings */}
            {meetings.participating.filter(m => filter === 'all' || m.status === filter).length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Invited Meetings ({meetings.participating.filter(m => filter === 'all' || m.status === filter).length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {meetings.participating
                    .filter(m => filter === 'all' || m.status === filter)
                    .map((meeting) => (
                      <MeetingCard key={meeting.id} meeting={meeting} isOwn={false} />
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
