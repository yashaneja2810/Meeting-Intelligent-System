import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import DashboardLayout from '@/components/DashboardLayout';

const LANGS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi (हिंदी)' },
  { value: 'hi-en', label: 'Hinglish (मिक्स)' },
];

const FEATURES = [
  'HD video & audio for up to 5 participants',
  'Screen sharing and presentation mode',
  'Real-time chat (public and private)',
  'Live AI transcription and subtitles',
  'Reactions, polls and hand raising',
  'AI-powered meeting summary & task extraction',
];

export default function CreateLiveMeeting() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', description: '', scheduledAt: '',
    meetingType: 'instant', transcriptLanguage: 'en', participantIds: []
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchTeamMembers(); }, []);

  const fetchTeamMembers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await api.get('/team', { headers: { Authorization: `Bearer ${session.access_token}` } });
      const members = Array.isArray(response) ? response : [];
      setTeamMembers(members.filter(m => m.is_active));
    } catch (error) {
      setError('Failed to load team members');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.participantIds.length === 0) { setError('Please select at least one team member'); return; }
    if (formData.participantIds.length > 5) { setError('Maximum 5 participants allowed'); return; }
    try {
      setLoading(true); setError('');
      const { data: { session } } = await supabase.auth.getSession();
      const response = await api.post('/live-meetings', { ...formData, scheduledAt: formData.scheduledAt || null }, { headers: { Authorization: `Bearer ${session.access_token}` } });
      const meetingId = response.meeting?.id;
      if (!meetingId) throw new Error('Meeting created but no ID returned');
      if (formData.meetingType === 'instant') navigate(`/live-meetings/${meetingId}`);
      else navigate('/live-meetings');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  const toggleParticipant = (id) => {
    setFormData(prev => ({
      ...prev,
      participantIds: prev.participantIds.includes(id)
        ? prev.participantIds.filter(x => x !== id)
        : [...prev.participantIds, id]
    }));
  };

  const set = (k, v) => setFormData(prev => ({ ...prev, [k]: v }));

  return (
    <DashboardLayout>
      <div style={{ padding: '24px 16px', maxWidth: 900 }}>
        <style>{`
          @media (min-width: 769px) {
            .clm-container { padding: 32px 36px !important; }
          }
          @media (max-width: 768px) {
            .clm-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <button
            onClick={() => navigate('/live-meetings')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0 }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
          >
            ← Back to Meetings
          </button>
          <h1 className="page-title">Create Meeting</h1>
          <p className="page-subtitle">Set up a video meeting with real-time AI transcription.</p>
        </div>

        <div className="clm-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#f87171', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <span>⚠</span> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Meeting Type */}
              <div className="card" style={{ padding: 20 }}>
                <label className="label">Meeting Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { key: 'instant', emoji: '⚡', label: 'Instant', desc: 'Start right now' },
                    { key: 'scheduled', emoji: '📅', label: 'Scheduled', desc: 'Pick a time' },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => set('meetingType', opt.key)}
                      style={{
                        padding: '14px 16px', borderRadius: 10, textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s ease',
                        background: formData.meetingType === opt.key ? 'rgba(255,255,255,0.08)' : 'var(--bg-elevated)',
                        border: `1px solid ${formData.meetingType === opt.key ? 'rgba(255,255,255,0.25)' : 'var(--border-default)'}`,
                        boxShadow: formData.meetingType === opt.key ? '0 0 0 2px rgba(255,255,255,0.08)' : 'none'
                      }}
                    >
                      <div style={{ fontSize: 20, marginBottom: 8 }}>{opt.emoji}</div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Description */}
              <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="label">Meeting Title <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input
                    className="input"
                    type="text"
                    value={formData.title}
                    onChange={e => set('title', e.target.value)}
                    placeholder="e.g., Weekly Team Sync"
                    maxLength={200}
                    required
                  />
                </div>
                <div>
                  <label className="label">Description <span style={{ color: 'var(--text-tertiary)', fontSize: 10, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <textarea
                    className="input"
                    value={formData.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Add any details about the meeting..."
                    rows={3}
                    style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
                  />
                </div>
              </div>

              {/* Scheduled Time */}
              <AnimatePresence>
                {formData.meetingType === 'scheduled' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="card" style={{ padding: 20, overflow: 'hidden' }}>
                    <label className="label">Schedule For <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input
                      className="input"
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={e => set('scheduledAt', e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      required
                      style={{ colorScheme: 'dark' }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Language */}
              <div className="card" style={{ padding: 20 }}>
                <label className="label">Transcription Language</label>
                <select
                  className="input"
                  value={formData.transcriptLanguage}
                  onChange={e => set('transcriptLanguage', e.target.value)}
                  style={{ colorScheme: 'dark' }}
                >
                  {LANGS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8 }}>Primary language for real-time AI transcription.</p>
              </div>

              {/* Participants */}
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                      Invite Participants <span style={{ color: 'var(--danger)' }}>*</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Max 5 participants</div>
                  </div>
                  <span className="badge badge-default">{formData.participantIds.length} / 5</span>
                </div>

                {teamMembers.length === 0 ? (
                  <div className="empty-state" style={{ padding: '40px 24px' }}>
                    <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 12 }}>No team members available</p>
                    <button className="btn-secondary" type="button" onClick={() => navigate('/admin/team')} style={{ fontSize: 13 }}>Add Team Members</button>
                  </div>
                ) : (
                  <div style={{ maxHeight: 320, overflowY: 'auto' }} className="custom-scrollbar">
                    {teamMembers.map(member => {
                      const isSelected = formData.participantIds.includes(member.id);
                      const isDisabled = !isSelected && formData.participantIds.length >= 5;
                      return (
                        <label
                          key={member.id}
                          style={{
                            display: 'flex', alignItems: 'center', padding: '12px 20px', cursor: isDisabled ? 'not-allowed' : 'pointer',
                            borderBottom: '1px solid var(--border-subtle)', opacity: isDisabled ? 0.4 : 1,
                            background: isSelected ? 'rgba(255,255,255,0.04)' : 'transparent',
                            transition: 'background 0.15s ease'
                          }}
                          onMouseOver={e => !isDisabled && !isSelected && (e.currentTarget.style.background = 'var(--bg-elevated)')}
                          onMouseOut={e => !isSelected && (e.currentTarget.style.background = 'transparent')}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => !isDisabled && toggleParticipant(member.id)}
                            disabled={isDisabled}
                            style={{ display: 'none' }}
                          />
                          {/* Custom checkbox */}
                          <div style={{
                            width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginRight: 12,
                            background: isSelected ? '#ffffff' : 'transparent',
                            border: `1.5px solid ${isSelected ? '#ffffff' : 'var(--border-strong)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s ease'
                          }}>
                            {isSelected && <svg style={{ width: 10, height: 10 }} fill="none" stroke="#0c0c0e" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <div className="avatar" style={{ marginRight: 12 }}>
                            {member.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{member.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.email}</div>
                          </div>
                          {member.role && <span className="chip" style={{ marginLeft: 8, flexShrink: 0 }}>{member.role}</span>}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="submit"
                  disabled={loading || formData.participantIds.length === 0}
                  className="btn-primary"
                  style={{ flex: 1, padding: '12px', fontSize: 14.5, borderRadius: 11, justifyContent: 'center' }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="spinner" style={{ width: 16, height: 16 }} />
                      {formData.meetingType === 'instant' ? 'Creating room...' : 'Scheduling...'}
                    </span>
                  ) : (
                    formData.meetingType === 'instant' ? '⚡ Create & Join Now' : '📅 Schedule Meeting'
                  )}
                </button>
                <button type="button" className="btn-secondary" onClick={() => navigate('/live-meetings')} style={{ padding: '12px 20px', fontSize: 14.5, borderRadius: 11 }}>
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>

          {/* Sidebar info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>What's included</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {FEATURES.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    <svg style={{ width: 14, height: 14, color: 'var(--success)', flexShrink: 0, marginTop: 1 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 20, background: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Participant Limit</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 4 }}>5</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>max participants per meeting</div>
              <div className="divider" style={{ margin: '14px 0' }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Selected</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: formData.participantIds.length > 0 ? 'var(--success)' : 'var(--text-tertiary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {formData.participantIds.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
