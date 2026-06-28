import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import DashboardLayout from '@/components/DashboardLayout'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'

export default function EmployeeDashboard() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const [stats, setStats] = useState({ totalTasks: 0, pendingTasks: 0, inProgressTasks: 0, completedTasks: 0, pendingInvites: 0 })
  const [recentTasks, setRecentTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDashboard() }, [])

  const loadDashboard = async () => {
    try {
      const [tasks, invites] = await Promise.all([api.get('/my-tasks'), api.get('/invites/received')])
      setStats({
        totalTasks: tasks.length,
        pendingTasks: tasks.filter(t => t.status === 'pending').length,
        inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        pendingInvites: invites.length
      })
      setRecentTasks(tasks.slice(0, 6))
    } catch (err) {
      console.error('Load dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const completionPct = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '32px 36px', maxWidth: 1300 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 className="page-title">My Workspace</h1>
            <p className="page-subtitle">Track your tasks and stay aligned with your team.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {stats.pendingInvites > 0 && (
              <button className="btn-secondary" onClick={() => navigate('/employee/invites')} style={{ gap: 8 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  {stats.pendingInvites}
                </span>
                Invites
              </button>
            )}
            <button className="btn-primary" onClick={() => navigate('/live-meetings')}>Live Meetings</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Tasks', value: stats.totalTasks, path: '/employee/tasks', color: 'var(--text-primary)' },
            { label: 'Pending', value: stats.pendingTasks, path: '/employee/tasks', color: 'var(--warning)' },
            { label: 'In Progress', value: stats.inProgressTasks, path: '/employee/tasks', color: 'var(--info)' },
            { label: 'Completed', value: stats.completedTasks, path: '/employee/tasks', color: 'var(--success)' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="card" onClick={() => navigate(s.path)}
              style={{ padding: '20px 22px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
            >
              <div className="noise-overlay" />
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 8, position: 'relative' }}>{s.value}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', position: 'relative' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="card" style={{ padding: '18px 22px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Task Completion</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{completionPct}%</span>
              </div>
              <div className="progress-track">
                <motion.div className="progress-bar" initial={{ width: 0 }} animate={{ width: `${completionPct}%` }} transition={{ duration: 0.8 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>My Tasks</span>
            <button className="btn-ghost" onClick={() => navigate('/employee/tasks')} style={{ fontSize: 12, padding: '5px 10px' }}>View all →</button>
          </div>
          {recentTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg style={{width:22,height:22}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>No tasks assigned yet</p>
              <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>Tasks will appear here once assigned by your manager.</p>
            </div>
          ) : (
            recentTasks.map((task) => {
              const s = { completed: { label: 'Done', c: 'var(--success)' }, in_progress: { label: 'Active', c: 'var(--warning)' }, pending: { label: 'Pending', c: 'var(--text-tertiary)' } }[task.status] || { label: 'Pending', c: 'var(--text-tertiary)' }
              return (
                <div key={task.id} className="table-row" onClick={() => navigate('/employee/tasks')} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.c, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{task.title}</p>
                    {task.due_date && <p style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>Due {new Date(task.due_date).toLocaleDateString()}</p>}
                  </div>
                  <span className="badge" style={{ color: s.c, borderColor: s.c + '30', background: s.c + '12', flexShrink: 0, fontSize: 10.5, padding: '2px 7px' }}>{s.label}</span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
