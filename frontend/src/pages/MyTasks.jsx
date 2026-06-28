import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import DashboardLayout from '@/components/DashboardLayout'
import AlertDialog from '@/components/AlertDialog'
import { motion, AnimatePresence } from 'framer-motion'

export default function MyTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedTask, setSelectedTask] = useState(null)
  const [showCompletionModal, setShowCompletionModal] = useState(null)
  const [completionNotes, setCompletionNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [alertDialog, setAlertDialog] = useState(null)

  useEffect(() => { loadTasks() }, [filter])

  const loadTasks = async () => {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : ''
      const data = await api.get(`/my-tasks${params}`)
      setTasks(data)
    } catch (err) {
      console.error('Load tasks error:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.put(`/my-tasks/${taskId}/status`, { status })
      loadTasks()
      setSelectedTask(null)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleRequestCompletion = (task) => {
    setShowCompletionModal(task)
    setCompletionNotes('')
  }

  const submitCompletionRequest = async () => {
    if (!showCompletionModal) return
    setSubmitting(true)
    try {
      await api.post('/completion-requests', { taskId: showCompletionModal.id, completionNotes })
      setAlertDialog({ title: 'Request Submitted', message: 'Completion request submitted! Your admin will review it.', variant: 'success' })
      setShowCompletionModal(null)
      setCompletionNotes('')
      loadTasks()
    } catch (err) {
      setAlertDialog({ title: 'Submit Failed', message: 'Failed to submit completion request.', variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const getPriorityBadge = (p) => {
    const map = { urgent: { label: 'Urgent', c: 'var(--danger)' }, high: { label: 'High', c: 'var(--warning)' }, medium: { label: 'Medium', c: 'var(--info)' }, low: { label: 'Low', c: 'var(--text-tertiary)' } }
    return map[p] || map.low
  }

  const getStatusBadge = (s) => {
    const map = { completed: { label: 'Completed', c: 'var(--success)' }, in_progress: { label: 'In Progress', c: 'var(--info)' }, pending_review: { label: 'In Review', c: '#a855f7' }, blocked: { label: 'Blocked', c: 'var(--danger)' }, pending: { label: 'Pending', c: 'var(--warning)' } }
    return map[s] || { label: s, c: 'var(--text-tertiary)' }
  }

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
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
      <div style={{ padding: '32px 36px', maxWidth: 1200, margin: '0 auto' }}>

        <div style={{ marginBottom: 40 }}>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">Your personalized action items.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
          <div className="card" style={{ padding: 24, cursor: 'pointer', border: filter === 'all' ? '1px solid var(--info)' : undefined }} onClick={() => setFilter('all')}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Total Tasks</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{stats.total}</p>
          </div>
          <div className="card" style={{ padding: 24, cursor: 'pointer', border: filter === 'pending' ? '1px solid var(--warning)' : undefined }} onClick={() => setFilter('pending')}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Pending</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--warning)' }}>{stats.pending}</p>
          </div>
          <div className="card" style={{ padding: 24, cursor: 'pointer', border: filter === 'in_progress' ? '1px solid var(--info)' : undefined }} onClick={() => setFilter('in_progress')}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>In Progress</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--info)' }}>{stats.inProgress}</p>
          </div>
          <div className="card" style={{ padding: 24, cursor: 'pointer', border: filter === 'completed' ? '1px solid var(--success)' : undefined }} onClick={() => setFilter('completed')}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Completed</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--success)' }}>{stats.completed}</p>
          </div>
        </div>

        <div style={{ display: 'flex', marginBottom: 32, overflowX: 'auto' }} className="custom-scrollbar">
          <div style={{ display: 'inline-flex', background: 'var(--bg-overlay)', padding: 4, borderRadius: 100, border: '1px solid var(--border-default)' }}>
            {['all', 'pending', 'in_progress', 'completed', 'blocked'].map((status) => (
              <button
                key={status} onClick={() => setFilter(status)}
                style={{
                  padding: '8px 24px', borderRadius: 100, fontSize: 13, fontWeight: 700, transition: 'all 0.2s', border: 'none', cursor: 'pointer',
                  background: filter === status ? 'var(--bg-elevated)' : 'transparent',
                  color: filter === status ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  boxShadow: filter === status ? 'var(--shadow-sm)' : 'none', whiteSpace: 'nowrap'
                }}
              >
                {status === 'all' ? 'All Tasks' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="card empty-state" style={{ padding: 60 }}>
            <div className="empty-icon" style={{ marginBottom: 16 }}>
              <svg style={{width:24,height:24}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{filter === 'all' ? 'All caught up!' : `No ${filter.replace('_', ' ')} tasks`}</p>
            <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>You have no tasks matching this criteria.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
            <AnimatePresence>
              {tasks.map((task, index) => {
                const s = getStatusBadge(task.status)
                const p = getPriorityBadge(task.priority)
                return (
                  <motion.div key={task.id} layout initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.05 }} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: 24, flex: 1, cursor: 'pointer' }} onClick={() => setSelectedTask(task)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>{task.title}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
                          <span className="badge badge-default" style={{ color: s.c, borderColor: s.c + '30', background: s.c + '12' }}>{s.label}</span>
                          <span className="badge badge-default" style={{ color: p.c, borderColor: p.c + '30', background: p.c + '12' }}>{p.label} Priority</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{task.description}</p>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: 'var(--bg-elevated)', padding: 16, borderRadius: 12, border: '1px solid var(--border-default)' }}>
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Deadline</p>
                          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Not set'}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Source</p>
                          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.meeting?.title || 'External'}</p>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-overlay)', display: 'flex', justifyContent: 'flex-end', gap: 12, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 }}>
                      {task.status === 'pending' && <button onClick={() => updateTaskStatus(task.id, 'in_progress')} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>Start Working</button>}
                      {task.status === 'in_progress' && (
                        <>
                          <button onClick={() => updateTaskStatus(task.id, 'blocked')} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13, color: 'var(--danger)', borderColor: 'var(--danger)30' }}>Mark Blocked</button>
                          <button onClick={() => handleRequestCompletion(task)} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13, background: 'var(--success)' }}>Request Completion</button>
                        </>
                      )}
                      {task.status === 'pending_review' && (
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#a855f7', display: 'flex', alignItems: 'center', gap: 6 }}><span className="spinner" style={{width: 12, height: 12, borderColor: '#a855f750', borderTopColor: '#a855f7'}}/> Pending Admin Review</div>
                      )}
                      {task.status === 'blocked' && <button onClick={() => updateTaskStatus(task.id, 'in_progress')} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>Resume Task</button>}
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
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card custom-scrollbar" style={{ padding: 40, width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div style={{ width: 48, height: 48, background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📋</div>
                  <button onClick={() => setSelectedTask(null)} className="btn-ghost" style={{ padding: 8, borderRadius: '50%' }}><svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                
                <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>{selectedTask.title}</h2>
                <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
                  <span className="badge badge-default" style={{ color: getPriorityBadge(selectedTask.priority).c, borderColor: getPriorityBadge(selectedTask.priority).c + '30', background: getPriorityBadge(selectedTask.priority).c + '12' }}>{getPriorityBadge(selectedTask.priority).label} Priority</span>
                  <span className="badge badge-default" style={{ color: getStatusBadge(selectedTask.status).c, borderColor: getStatusBadge(selectedTask.status).c + '30', background: getStatusBadge(selectedTask.status).c + '12' }}>{getStatusBadge(selectedTask.status).label}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Description</h4>
                    <div style={{ background: 'var(--bg-elevated)', padding: 24, borderRadius: 16, border: '1px solid var(--border-default)', fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {selectedTask.description}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div style={{ background: 'var(--bg-elevated)', padding: 20, borderRadius: 16, border: '1px solid var(--border-default)' }}>
                      <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Due Date</h4>
                      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedTask.deadline ? new Date(selectedTask.deadline).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Not set'}</p>
                    </div>
                    <div style={{ background: 'var(--bg-elevated)', padding: 20, borderRadius: 16, border: '1px solid var(--border-default)' }}>
                      <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Source Context</h4>
                      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{selectedTask.meeting?.title || 'Unknown Source'}</p>
                      {selectedTask.meeting && <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{new Date(selectedTask.meeting.created_at).toLocaleDateString()}</p>}
                    </div>
                  </div>

                  {selectedTask.assignment_reason && (
                    <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 16, padding: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <span style={{ fontSize: 16 }}>🤖</span>
                        <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Reasoning</h4>
                        {selectedTask.assignment_confidence && (
                          <span style={{ marginLeft: 'auto', background: 'var(--info)12', color: 'var(--info)', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{(selectedTask.assignment_confidence * 100).toFixed(0)}% Precise</span>
                        )}
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic', background: 'var(--bg-overlay)', padding: 16, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>"{selectedTask.assignment_reason}"</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCompletionModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card" style={{ padding: 32, width: '100%', maxWidth: 500 }}>
                <div style={{ width: 48, height: 48, background: 'var(--success)12', color: 'var(--success)', borderRadius: 12, border: '1px solid var(--success)30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 24 }}>✓</div>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>Request Completion</h3>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{showCompletionModal.title}</p>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>Submit for admin review to formally mark this task as finished.</p>

                <div style={{ marginBottom: 32 }}>
                  <label className="label">Completion Notes <span style={{ color: 'var(--text-tertiary)', textTransform: 'none', letterSpacing: 0 }}>(Optional)</span></label>
                  <textarea
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="Describe what you've accomplished, PR links, or context..."
                    className="input custom-scrollbar"
                    style={{ minHeight: 120, resize: 'vertical' }}
                    disabled={submitting}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setShowCompletionModal(null)} disabled={submitting} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                  <button onClick={submitCompletionRequest} disabled={submitting} className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: 'var(--success)' }}>
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AlertDialog isOpen={!!alertDialog} onClose={() => setAlertDialog(null)} title={alertDialog?.title} message={alertDialog?.message} variant={alertDialog?.variant} />
      </div>
    </DashboardLayout>
  )
}
