import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import DashboardLayout from '@/components/DashboardLayout';

const STATUS = {
  scheduled: { label: 'Scheduled', color: 'var(--info)',    bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)' },
  active:    { label: 'Live',      color: 'var(--success)', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.2)', pulse: true },
  ended:     { label: 'Ended',     color: 'var(--text-tertiary)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.06)' },
  cancelled: { label: 'Cancelled', color: 'var(--danger)',  bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)' },
};

function fmt(d) {
  if (!d) return null;
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function MeetingCard({ meeting, isOwn, onJoin, onViewResults, onDelete }) {
  const s = STATUS[meeting.status] || STATUS.ended;
  const isActive = meeting.status === 'active';
  const isEnded = meeting.status === 'ended';
  const isScheduled = meeting.status === 'scheduled';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="card"
      style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 0 }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>{meeting.title}</h3>
          {meeting.description && <p style={{ fontSize: 12, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meeting.description}</p>}
        </div>
        {/* Status badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 100, background: s.bg, border: `1px solid ${s.border}`, flexShrink: 0 }}>
          {s.pulse ? (
            <span style={{ position: 'relative', display: 'flex', width: 7, height: 7 }}>
              <span className="pulse-ring" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: s.color, opacity: 0.6 }} />
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, position: 'relative' }} />
            </span>
          ) : (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
          )}
          <span style={{ fontSize: 11, fontWeight: 700, color: s.color, letterSpacing: '0.03em' }}>{s.label}</span>
        </div>
      </div>

      {/* Meta info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        {[
          meeting.scheduled_at && { icon: '📅', text: fmt(meeting.scheduled_at) },
          meeting.started_at && { icon: '▶', text: `Started ${fmt(meeting.started_at)}` },
          meeting.ended_at && { icon: '✓', text: `Ended ${fmt(meeting.ended_at)}` },
          meeting.duration_minutes && { icon: '⏱', text: `${meeting.duration_minutes} min` },
          { icon: '👥', text: `${meeting.participants?.length || 0} participant${meeting.participants?.length !== 1 ? 's' : ''}` },
        ].filter(Boolean).map((row, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-tertiary)' }}>
            <span style={{ fontSize: 11 }}>{row.icon}</span>
            <span>{row.text}</span>
          </div>
        ))}
        {isOwn && <span className="chip" style={{ alignSelf: 'flex-start', marginTop: 2 }}>Host</span>}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        {isActive && (
          <button className="btn-primary" style={{ flex: 1, fontSize: 13, padding: '9px 14px' }} onClick={() => onJoin(meeting.id)}>
            Join Meeting
          </button>
        )}
        {isScheduled && isOwn && (
          <button className="btn-primary" style={{ flex: 1, fontSize: 13, padding: '9px 14px' }} onClick={async () => {
            try {
              const { data: { session } } = await supabase.auth.getSession();
              await api.post(`/live-meetings/${meeting.id}/start`, {}, { headers: { Authorization: `Bearer ${session.access_token}` } });
            } catch (e) {
              console.error(e);
            }
            onJoin(meeting.id);
          }}>
            Start Meeting
          </button>
        )}
        {isScheduled && !isOwn && (
          <button disabled style={{ flex: 1, fontSize: 13, padding: '9px 14px', background: 'var(--bg-overlay)', color: 'var(--text-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 9, cursor: 'not-allowed', fontWeight: 600 }}>
            Waiting to Start
          </button>
        )}
        {isEnded && (
          <>
            <button className="btn-primary" style={{ flex: 1, fontSize: 13, padding: '9px 14px' }} onClick={() => onViewResults(meeting.id)}>
              View Summary
            </button>
            {meeting.processed && (
              <button className="btn-secondary" style={{ fontSize: 13, padding: '9px 14px' }} onClick={() => {}}>
                Tasks
              </button>
            )}
          </>
        )}
        {isOwn && (
          <button
            onClick={() => onDelete(meeting.id, meeting.title)}
            style={{ padding: '9px 12px', borderRadius: 9, background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)', cursor: 'pointer', transition: 'all 0.15s ease', fontSize: 14 }}
            title="Delete"
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)' }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
          >
            ×
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function LiveMeetings() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState({ own: [], participating: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchMeetings(); }, [filter]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      let url = '/live-meetings';
      if (filter !== 'all') url += `?status=${filter}`;
      const response = await api.get(url, { headers: { Authorization: `Bearer ${session.access_token}` } });
      setMeetings({ own: response.ownMeetings || [], participating: response.participatingMeetings || [] });
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setMeetings({ own: [], participating: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await api.delete(`/live-meetings/${id}`, { headers: { Authorization: `Bearer ${session.access_token}` } });
      fetchMeetings();
    } catch (e) {
      alert('Failed to delete. Try again.');
    }
  };

  const allMeetings = [...meetings.own, ...meetings.participating];
  const filteredOwn = meetings.own.filter(m => filter === 'all' || m.status === filter);
  const filteredParticipating = meetings.participating.filter(m => filter === 'all' || m.status === filter);

  const TABS = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Live' },
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'ended', label: 'Ended' },
  ];

  const STATS = [
    { label: 'Scheduled', value: meetings.own.filter(m => m.status === 'scheduled').length, color: 'var(--info)' },
    { label: 'Live Now', value: allMeetings.filter(m => m.status === 'active').length, color: 'var(--success)', pulse: true },
    { label: 'Completed', value: allMeetings.filter(m => m.status === 'ended').length, color: 'var(--text-secondary)' },
  ];

  return (
    <DashboardLayout>
      <div style={{ padding: '32px 36px', maxWidth: 1300 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 className="page-title">Live Meetings</h1>
            <p className="page-subtitle">Create and join interactive video meetings with your team.</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/live-meetings/create')} style={{ gap: 8 }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
            New Meeting
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {STATS.map(s => (
            <div key={s.label} className="card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
              {s.pulse ? (
                <span style={{ position: 'relative', width: 10, height: 10, flexShrink: 0 }}>
                  <span className="pulse-ring" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: s.color, opacity: 0.6 }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, position: 'relative', display: 'block' }} />
                </span>
              ) : (
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              )}
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              style={{
                padding: '7px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease', border: 'none',
                background: filter === t.key ? 'var(--bg-elevated)' : 'transparent',
                color: filter === t.key ? 'var(--text-primary)' : 'var(--text-tertiary)',
                boxShadow: filter === t.key ? '0 1px 3px rgba(0,0,0,0.3), inset 0 0 0 1px var(--border-default)' : 'none'
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <div className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        ) : (filteredOwn.length === 0 && filteredParticipating.length === 0) ? (
          <div className="card empty-state">
            <div className="empty-icon">
              <svg style={{width:22,height:22}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            </div>
            <p style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              {filter === 'all' ? 'No meetings yet' : `No ${filter} meetings`}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>
              {filter === 'all' ? 'Create your first meeting to get started.' : `No meetings with status "${filter}" found.`}
            </p>
            <button className="btn-primary" onClick={() => navigate('/live-meetings/create')} style={{ fontSize: 13 }}>+ New Meeting</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {filteredOwn.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <h2 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>My Meetings</h2>
                  <span className="badge badge-default">{filteredOwn.length}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                  {filteredOwn.map(m => (
                    <MeetingCard key={m.id} meeting={m} isOwn
                      onJoin={id => navigate(`/live-meetings/${id}`)}
                      onViewResults={id => navigate(`/live-meetings/${id}/results`)}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}
            {filteredParticipating.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <h2 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Invited Meetings</h2>
                  <span className="badge badge-default">{filteredParticipating.length}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                  {filteredParticipating.map(m => (
                    <MeetingCard key={m.id} meeting={m} isOwn={false}
                      onJoin={id => navigate(`/live-meetings/${id}`)}
                      onViewResults={id => navigate(`/live-meetings/${id}/results`)}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
