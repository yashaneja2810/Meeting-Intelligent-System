import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import DashboardLayout from '@/components/DashboardLayout'
import ConfirmDialog from '@/components/ConfirmDialog'
import AlertDialog from '@/components/AlertDialog'
import { motion, AnimatePresence } from 'framer-motion'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', assigned_to: '' })
  const [selectedTask, setSelectedTask] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [alertDialog, setAlertDialog] = useState(null)

  useEffect(() => { loadData() }, [filters])

  const loadData = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.assigned_to) params.append('assigned_to', filters.assigned_to)
      const [tasksData, teamData] = await Promise.all([api.get(`/tasks?${params}`), api.get('/team')])
      setTasks(tasksData)
      setTeamMembers(teamData)
    } catch (err) {
      console.error('Load tasks error:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status })
      loadData()
    } catch (err) {
      setAlertDialog({ title: 'Update Failed', message: err.message, variant: 'error' })
    }
  }

  const reassignTask = async (taskId, assignedTo) => {
    try {
      await api.post(`/tasks/${taskId}/reassign`, { assigned_to: assignedTo, reason: 'Manual reassignment by user' })
      loadData()
      setSelectedTask(null)
    } catch (err) {
      setAlertDialog({ title: 'Reassignment Failed', message: err.message, variant: 'error' })
    }
  }

  const deleteTask = async (taskId, taskTitle) => {
    setConfirmDialog({
      title: 'Delete Task',
      message: `Are you sure you want to delete "${taskTitle}"?`,
      onConfirm: async () => {
        try { await api.delete(`/tasks/${taskId}`); loadData() }
        catch (err) { setAlertDialog({ title: 'Delete Failed', message: err.message, variant: 'error' }) }
      }
    })
  }

  const getPriorityInfo = (p) => {
    const map = {
      urgent: { label: 'Urgent', c: 'var(--danger)' },
      high: { label: 'High', c: 'var(--warning)' },
      medium: { label: 'Medium', c: 'var(--info)' },
      low: { label: 'Low', c: 'var(--text-tertiary)' }
    }
    return map[p] || map.low
  }

  const getStatusInfo = (s) => {
    const map = {
      completed: { label: 'Completed', c: 'var(--success)' },
      in_progress: { label: 'In Progress', c: 'var(--info)' },
      blocked: { label: 'Blocked', c: 'var(--danger)' },
      pending: { label: 'Pending', c: 'var(--warning)' },
      cancelled: { label: 'Cancelled', c: 'var(--text-tertiary)' }
    }
    return map[s] || map.pending
  }

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div style={{ padding: '32px 36px', maxWidth: 1400, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 className="page-title">All Tasks</h1>
            <p className="page-subtitle">Track, manage, and reassign tasks identified by AI.</p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input"
              style={{ padding: '8px 16px', borderRadius: 100, minWidth: 160, fontSize: 13 }}
            >
              <option value="">Status: All</option>
              <option value="pending">Status: Pending</option>
              <option value="in_progress">Status: In Progress</option>
              <option value="completed">Status: Completed</option>
              <option value="blocked">Status: Blocked</option>
            </select>
            <select
              value={filters.assigned_to}
              onChange={(e) => setFilters({ ...filters, assigned_to: e.target.value })}
              className="input"
              style={{ padding: '8px 16px', borderRadius: 100, minWidth: 160, fontSize: 13 }}
            >
              <option value="">Assignee: All</option>
              {teamMembers.map((m) => <option key={m.id} value={m.id}>Assignee: {m.name}</option>)}
            </select>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="card empty-state" style={{ padding: 60 }}>
            <div className="empty-icon" style={{ marginBottom: 16 }}>
              <svg style={{width:24,height:24}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No tasks found</p>
            <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Adjust your filters or upload a new meeting.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
            <AnimatePresence>
              {tasks.map((task, idx) => {
                const s = getStatusInfo(task.status)
                const p = getPriorityInfo(task.priority)
                return (
                  <motion.div
                    layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.05 }}
                    key={task.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}
                  >
                    <div style={{ padding: 24, flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 16 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{task.title}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
                          <span className="badge badge-default" style={{ color: s.c, borderColor: s.c + '30', background: s.c + '12' }}>{s.label}</span>
                          <span className="badge badge-default" style={{ color: p.c, borderColor: p.c + '30', background: p.c + '12' }}>{p.label} Priority</span>
                        </div>
                      </div>

                      <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {task.description}
                      </p>

                      <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: 16, border: '1px solid var(--border-default)', marginBottom: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          <div>
                            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Assignee</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div className="avatar" style={{ width: 20, height: 20, fontSize: 10 }}>{task.assigned_member?.name?.[0] || '?'}</div>
                              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.assigned_member?.name || 'Unassigned'}</span>
                            </div>
                          </div>
                          <div>
                            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Deadline</p>
                            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                              {task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Not set'}
                            </p>
                          </div>
                        </div>

                        {task.assignment_reason && (
                          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                              <svg style={{ width: 12, height: 12, color: 'var(--info)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Reasoning</span>
                              {task.assignment_confidence && (
                                <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: 'var(--info)', background: 'rgba(59,130,246,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                                  {(task.assignment_confidence * 100).toFixed(0)}% Match
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5, borderLeft: '2px solid var(--border-strong)', paddingLeft: 8 }}>{task.assignment_reason}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottomLeftRadius: 18, borderBottomRightRadius: 18 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                          className="input" style={{ padding: '6px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, border: '1px solid var(--border-default)', background: 'var(--bg-base)' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="blocked">Blocked</option>
                        </select>
                        {task.status !== 'completed' && (
                          <button onClick={() => setSelectedTask(task)} className="btn-secondary" style={{ padding: '6px 12px', borderRadius: 100, fontSize: 12 }}>
                            Reassign
                          </button>
                        )}
                      </div>
                      <button onClick={() => deleteTask(task.id, task.title)} className="btn-ghost" style={{ padding: 6, color: 'var(--danger)', borderRadius: '50%' }}>
                        <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence>
          {selectedTask && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card" style={{ padding: 32, width: '100%', maxWidth: 440 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Reassign Task</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>{selectedTask.title}</p>
                
                <div style={{ marginBottom: 32 }}>
                  <label className="label">Select New Assignee</label>
                  <select
                    className="input-lg"
                    onChange={(e) => { if (e.target.value) reassignTask(selectedTask.id, e.target.value) }}
                    defaultValue=""
                  >
                    <option value="" disabled>Select team member...</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} — {m.role}</option>
                    ))}
                  </select>
                </div>
                
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setSelectedTask(null)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>Cancel</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <ConfirmDialog isOpen={!!confirmDialog} onClose={() => setConfirmDialog(null)} onConfirm={confirmDialog?.onConfirm || (() => {})} title={confirmDialog?.title} message={confirmDialog?.message} variant="danger" confirmText="Delete" />
        <AlertDialog isOpen={!!alertDialog} onClose={() => setAlertDialog(null)} title={alertDialog?.title} message={alertDialog?.message} variant={alertDialog?.variant} />
      </div>
    </DashboardLayout>
  )
}
