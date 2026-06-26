import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

export default function CreateLiveMeeting() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    meetingType: 'instant',
    transcriptLanguage: 'en',
    participantIds: []
  });

  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await api.get('/team', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      // Backend returns array directly
      const members = Array.isArray(response) ? response : [];
      setTeamMembers(members.filter(tm => tm.is_active));
    } catch (error) {
      console.error('Error fetching team members:', error);
      setError('Failed to load team members');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.participantIds.length === 0) {
      setError('Please select at least one team member');
      return;
    }

    if (formData.participantIds.length > 5) {
      setError('Maximum 5 participants allowed');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await api.post('/live-meetings', {
        ...formData,
        scheduledAt: formData.scheduledAt || null
      }, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      // Backend returns { meeting, participants } directly
      const meetingId = response.meeting?.id;

      if (!meetingId) {
        throw new Error('Meeting created but no ID returned');
      }

      // Navigate to meeting or meeting list
      if (formData.meetingType === 'instant') {
        navigate(`/live-meetings/${meetingId}`);
      } else {
        navigate('/live-meetings');
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      setError(error.response?.data?.error || 'Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleParticipantToggle = (memberId) => {
    setFormData(prev => ({
      ...prev,
      participantIds: prev.participantIds.includes(memberId)
        ? prev.participantIds.filter(id => id !== memberId)
        : [...prev.participantIds, memberId]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/live-meetings')}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            ← Back to Meetings
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create Live Meeting</h1>
          <p className="text-gray-600 mt-2">
            Set up an interactive video meeting with your team
          </p>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6"
        >
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Weekly Team Sync"
              maxLength={200}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add any details about the meeting..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Meeting Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, meetingType: 'instant', scheduledAt: '' })}
                className={`p-4 rounded-lg border-2 transition-colors text-left ${
                  formData.meetingType === 'instant'
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">⚡</div>
                <div className="font-medium text-gray-900">Instant</div>
                <div className="text-sm text-gray-600">Start now</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, meetingType: 'scheduled' })}
                className={`p-4 rounded-lg border-2 transition-colors text-left ${
                  formData.meetingType === 'scheduled'
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">📅</div>
                <div className="font-medium text-gray-900">Scheduled</div>
                <div className="text-sm text-gray-600">Set a time</div>
              </button>
            </div>
          </div>

          {/* Scheduled Time */}
          {formData.meetingType === 'scheduled' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule For
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                min={new Date().toISOString().slice(0, 16)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          )}

          {/* Transcript Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transcription Language
            </label>
            <select
              value={formData.transcriptLanguage}
              onChange={(e) => setFormData({ ...formData, transcriptLanguage: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="en">English</option>
              <option value="hi">Hindi (हिंदी)</option>
              <option value="hi-en">Hinglish (मिक्स)</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Select the primary language for real-time transcription
            </p>
          </div>

          {/* Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invite Participants * (Max 5)
            </label>
            
            {teamMembers.length === 0 ? (
              <div className="border border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500 mb-4">No team members available</p>
                <button
                  type="button"
                  onClick={() => navigate('/admin/team')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Add Team Members
                </button>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {teamMembers.map((member) => {
                  const isSelected = formData.participantIds.includes(member.id);
                  const isDisabled = !isSelected && formData.participantIds.length >= 5;

                  return (
                    <label
                      key={member.id}
                      className={`flex items-center p-4 cursor-pointer transition-colors ${
                        isDisabled
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => !isDisabled && handleParticipantToggle(member.id)}
                        disabled={isDisabled}
                        className="w-4 h-4 rounded mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.email}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {member.role} • {member.skills?.join(', ') || 'No skills'}
                        </div>
                      </div>
                      {isSelected && (
                        <span className="text-green-600 text-xl">✓</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
            
            <p className="text-sm text-gray-500 mt-2">
              {formData.participantIds.length} of 5 participants selected
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || formData.participantIds.length === 0}
              className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Creating...' : formData.meetingType === 'instant' ? 'Create & Join' : 'Schedule Meeting'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/live-meetings')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </motion.form>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Meeting Features</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ HD video and audio with up to 5 participants</li>
            <li>✓ Screen sharing and presentation mode</li>
            <li>✓ Real-time chat (public and private)</li>
            <li>✓ Live transcription and subtitles</li>
            <li>✓ Interactive polls and hand raising</li>
            <li>✓ AI-powered meeting summary and task extraction</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
