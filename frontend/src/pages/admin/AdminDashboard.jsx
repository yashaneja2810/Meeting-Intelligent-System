import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import DashboardLayout from '@/components/DashboardLayout'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'

function PageLoader() {
  return (
    <DashboardLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', width: '100%' }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    </DashboardLayout>
  )
}

function StatCard({ label, value, icon, sub, onClick, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      onClick={onClick}
      style={{ padding: 24, cursor: onClick ? 'pointer' : 'default', position: 'relative', overflow: 'hidden' }}
    >
      <div className="noise-overlay" />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, position: 'relative' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-overlay)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          {icon}
        </div>
        {accent && <span style={{ width: 7, height: 7, borderRadius: '50%', background: accent, boxShadow: `0 0 8px ${accent}80` }} />}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1, marginBottom: 6, position: 'relative' }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', position: 'relative' }}>{label}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 4, position: 'relative' }}>{sub}</div>}
    </motion.div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const [stats, setStats] = useState({ totalTasks: 0, pendingTasks: 0, completedTasks: 0, teamMembers: 0, activeMeetings: 0, pendingInvites: 0 })
  const [recentTasks, setRecentTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDashboard() }, [])

  const loadDashboard = async () => {
    try {
      const [tasks, team, meetings, invites] = await Promise.all([
        api.get('/tasks'), api.get('/team'), api.get('/meetings'), api.get('/invites/sent')
      ])
      setStats({
        totalTasks: tasks.length,
        pendingTasks: tasks.filter(t => t.status === 'pending').length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        teamMembers: team.filter(m => m.invite_status === 'joined').length,
        activeMeetings: meetings.filter(m => m.processed).length,
        pendingInvites: invites.filter(i => i.status === 'pending').length
      })
      setRecentTasks(tasks.slice(0, 6))
    } catch (err) {
      console.error('Load dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const completionPct = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0

  if (loading) return <PageLoader />

  return (
    <DashboardLayout>
      <div style={{ padding: '32px 36px', maxWidth: 1300 }}>
        <style>{`
          @media (max-width: 768px) {
            .admin-bottom-grid { grid-template-columns: 1fr !important; }
            .admin-completion-bar { flex-direction: column; gap: 16px !important; }
            .admin-completion-divider { display: none !important; }
          }
        `}</style>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 className="page-title">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {profile?.display_name?.split(' ')[0] || 'Admin'} 👋
              </h1>
              <p className="page-subtitle" style={{ marginTop: 4 }}>Here's what's happening with your team today.</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-secondary" onClick={() => navigate('/live-meetings')} style={{ gap: 8 }}>
                <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                Live Meetings
              </button>
              <button className="btn-primary" onClick={() => navigate('/admin/upload')}>
                + Upload Meeting
              </button>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
          <StatCard label="Total Tasks" value={stats.totalTasks} onClick={() => navigate('/admin/tasks')}
            icon={<svg style={{width:16,height:16}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>}
          />
          <StatCard label="Pending" value={stats.pendingTasks} onClick={() => navigate('/admin/tasks')} accent="var(--warning)"
            icon={<svg style={{width:16,height:16}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          />
          <StatCard label="Completed" value={stats.completedTasks} onClick={() => navigate('/admin/tasks')} accent="var(--success)"
            icon={<svg style={{width:16,height:16}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          />
          <StatCard label="Team Members" value={stats.teamMembers} onClick={() => navigate('/admin/team')}
            icon={<svg style={{width:16,height:16}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
          />
          <StatCard label="Meetings Processed" value={stats.activeMeetings}
            icon={<svg style={{width:16,height:16}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>}
          />
          <StatCard label="Pending Invites" value={stats.pendingInvites} onClick={() => navigate('/admin/invites')} accent={stats.pendingInvites > 0 ? 'var(--info)' : undefined}
            icon={<svg style={{width:16,height:16}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
          />
        </div>

        {/* Completion bar */}
        <div className="card admin-completion-bar" style={{ padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Overall Completion</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{completionPct}%</span>
            </div>
            <div className="progress-track">
              <motion.div className="progress-bar" initial={{ width: 0 }} animate={{ width: `${completionPct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
            </div>
          </div>
          <div className="admin-completion-divider" style={{ width: 1, height: 36, background: 'var(--border-subtle)', flexShrink: 0 }} />
          <div style={{ display: 'flex', gap: 28 }}>
            {[{ l: 'Done', v: stats.completedTasks, c: 'var(--success)' }, { l: 'Active', v: stats.pendingTasks, c: 'var(--warning)' }].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.c, letterSpacing: '-0.02em' }}>{s.v}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tasks + Quick Actions */}
        <div className="admin-bottom-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 14 }}>

          {/* Recent Tasks */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="table-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>Recent Tasks</span>
              <button className="btn-ghost" onClick={() => navigate('/admin/tasks')} style={{ fontSize: 12, padding: '5px 10px' }}>View all →</button>
            </div>
            {recentTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg style={{width:22,height:22}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>No tasks yet</p>
                <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginBottom: 16 }}>Upload a meeting to let AI create tasks automatically.</p>
                <button className="btn-primary" onClick={() => navigate('/admin/upload')} style={{ fontSize: 13 }}>Upload Meeting</button>
              </div>
            ) : (
              recentTasks.map((task, i) => {
                const statusMap = {
                  completed: { label: 'Completed', color: 'var(--success)' },
                  in_progress: { label: 'In Progress', color: 'var(--warning)' },
                  pending: { label: 'Pending', color: 'var(--text-tertiary)' }
                }
                const s = statusMap[task.status] || statusMap.pending
                return (
                  <div key={task.id} className="table-row" onClick={() => navigate('/admin/tasks')} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{task.title}</p>
                      {task.assigned_member && (
                        <p style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>→ {task.assigned_member.name}</p>
                      )}
                    </div>
                    <span className="badge badge-default" style={{ color: s.color, borderColor: s.color + '30', background: s.color + '12', flexShrink: 0 }}>{s.label}</span>
                  </div>
                )
              })
            )}
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Upload Meeting', desc: 'Process a new transcript', path: '/admin/upload', icon: '↑', color: '#fff', bg: '#fff', textColor: '#0c0c0e' },
              { label: 'Live Meeting', desc: 'Start or join a room', path: '/live-meetings', icon: '▶', color: 'var(--info)' },
              { label: 'Team Management', desc: 'Manage members', path: '/admin/team', icon: '⚙', color: 'var(--text-secondary)' },
              { label: 'Audit Logs', desc: 'Review all activity', path: '/admin/audit', icon: '☰', color: 'var(--text-secondary)' },
            ].map(a => (
              <div
                key={a.label}
                className="card"
                onClick={() => navigate(a.path)}
                style={{ padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.15s ease' }}
                onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.borderColor = 'var(--border-default)' }}
                onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 9, background: a.bg || 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: a.textColor || a.color, flexShrink: 0, border: '1px solid var(--border-default)', fontWeight: 700 }}>
                  {a.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{a.label}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
