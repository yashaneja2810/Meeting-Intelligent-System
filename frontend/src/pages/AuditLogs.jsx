import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import DashboardLayout from '@/components/DashboardLayout'
import ConfirmDialog from '@/components/ConfirmDialog'
import AlertDialog from '@/components/AlertDialog'
import { motion, AnimatePresence } from 'framer-motion'

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [alertDialog, setAlertDialog] = useState(null)

  useEffect(() => { loadLogs() }, [filter])

  const loadLogs = async () => {
    try {
      const params = filter ? `?agent_name=${filter}` : ''
      const data = await api.get(`/audit${params}`)
      setLogs(data)
    } catch (err) {
      console.error('Load logs error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLog = async (logId) => {
    setConfirmDialog({
      title: 'Delete Audit Log',
      message: 'Are you sure you want to delete this audit log? This action cannot be undone.',
      onConfirm: async () => {
        setDeletingId(logId)
        try {
          await api.delete(`/audit/${logId}`)
          setLogs(logs.filter(log => log.id !== logId))
        } catch (err) {
          setAlertDialog({ title: 'Delete Failed', message: 'Failed to delete log.', variant: 'error' })
        } finally {
          setDeletingId(null)
        }
      }
    })
  }

  const handleClearAllLogs = async () => {
    try {
      await api.delete('/audit')
      setLogs([])
      setShowClearConfirm(false)
    } catch (err) {
      setAlertDialog({ title: 'Clear Failed', message: 'Failed to clear logs.', variant: 'error' })
    }
  }

  const getAgentDetails = (agentName) => {
    if (agentName.includes('Analyzer')) return { icon: '📝', c: 'var(--info)' }
    if (agentName.includes('Extraction')) return { icon: '🎯', c: '#a855f7' }
    if (agentName.includes('Assignment')) return { icon: '🤖', c: '#f97316' }
    if (agentName.includes('Tracking')) return { icon: '📊', c: 'var(--success)' }
    if (agentName.includes('Failure')) return { icon: '⚠', c: 'var(--danger)' }
    if (agentName.includes('Recovery')) return { icon: '🔄', c: '#14b8a6' }
    return { icon: '⚙', c: 'var(--text-tertiary)' }
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

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 className="page-title">Audit Logs</h1>
            <p className="page-subtitle">Complete transparency of all AI decisions, context, and framework actions.</p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input"
              style={{ padding: '8px 16px', borderRadius: 100, minWidth: 200, fontSize: 13 }}
            >
              <option value="">All Agents</option>
              <option value="Meeting Analyzer Agent">Meeting Analyzer</option>
              <option value="Task Extraction Agent">Task Extraction</option>
              <option value="Assignment Agent">Assignment</option>
              <option value="Tracking Agent">Tracking</option>
              <option value="Failure Detection Agent">Failure Detection</option>
              <option value="Recovery Agent">Recovery</option>
            </select>
            {logs.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="btn-secondary"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.25)', borderRadius: 100, padding: '8px 16px', fontSize: 13 }}
              >
                Clear Logs
              </button>
            )}
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="card empty-state" style={{ padding: 60 }}>
            <div className="empty-icon" style={{ marginBottom: 16 }}>
              <svg style={{width:24,height:24}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No audit logs yet</p>
            <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>AI framework actions will appear here once executed.</p>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Timeline line */}
            <div style={{ position: 'absolute', left: 24, top: 24, bottom: 24, width: 2, background: 'var(--border-subtle)', zIndex: 0 }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <AnimatePresence>
                {logs.map((log, index) => {
                  const agent = getAgentDetails(log.agent_name)
                  return (
                    <motion.div
                      layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.05 }}
                      key={log.id} style={{ display: 'flex', gap: 24, position: 'relative', zIndex: 1 }}
                    >
                      {/* Timeline dot/icon */}
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-surface)', border: `2px solid ${agent.c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
                        {agent.icon}
                      </div>

                      <div className="card" style={{ flex: 1, padding: 24, overflow: 'hidden' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                          <div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{log.action}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border-default)' }}>{log.agent_name}</span>
                              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                                {new Date(log.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit' })}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            {log.confidence_score && (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Confidence</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{(log.confidence_score * 100).toFixed(0)}%</span>
                                  <div style={{ width: 40, height: 6, background: 'var(--bg-overlay)', borderRadius: 100, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', background: agent.c, width: `${log.confidence_score * 100}%` }} />
                                  </div>
                                </div>
                              </div>
                            )}
                            <button
                              onClick={() => handleDeleteLog(log.id)}
                              disabled={deletingId === log.id}
                              className="btn-ghost"
                              style={{ padding: 6, color: 'var(--danger)', borderRadius: '50%' }}
                            >
                              {deletingId === log.id ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                            </button>
                          </div>
                        </div>

                        {/* Reasoning block */}
                        <div style={{ background: '#0a0a0a', border: '1px solid var(--border-default)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#111', borderBottom: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
                              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
                              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
                            </div>
                            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', marginLeft: 8 }}>REASONING_OUTPUT.log</span>
                          </div>
                          <div style={{ padding: 16, fontSize: 13, fontFamily: 'var(--font-mono)', color: '#4af626', lineHeight: 1.6, maxHeight: 150, overflowY: 'auto' }} className="custom-scrollbar">
                            <span style={{ color: 'var(--text-tertiary)', marginRight: 8 }}>{'>'}</span>{log.reasoning}
                          </div>
                        </div>

                        {/* Expandables */}
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          {log.input_data && Object.keys(log.input_data).length > 0 && (
                            <details style={{ flex: 1, minWidth: 250, cursor: 'pointer' }} className="group">
                              <summary style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', listStyle: 'none' }}>
                                Inspect Input Event
                              </summary>
                              <div style={{ marginTop: 8, padding: 16, background: '#0a0a0a', borderRadius: 10, border: '1px solid var(--border-subtle)', overflowX: 'auto' }} className="custom-scrollbar">
                                <pre style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', margin: 0 }}>{JSON.stringify(log.input_data, null, 2)}</pre>
                              </div>
                            </details>
                          )}
                          {log.output_data && Object.keys(log.output_data).length > 0 && (
                            <details style={{ flex: 1, minWidth: 250, cursor: 'pointer' }} className="group">
                              <summary style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', listStyle: 'none' }}>
                                Inspect Output Payloads
                              </summary>
                              <div style={{ marginTop: 8, padding: 16, background: '#0a0a0a', borderRadius: 10, border: '1px solid var(--border-subtle)', overflowX: 'auto' }} className="custom-scrollbar">
                                <pre style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', margin: 0 }}>{JSON.stringify(log.output_data, null, 2)}</pre>
                              </div>
                            </details>
                          )}
                        </div>

                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showClearConfirm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyItems: 'center', zIndex: 100, padding: 20 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card" style={{ padding: 32, width: '100%', maxWidth: 400, margin: 'auto' }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Clear All Logs?</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>This will permanently delete all {logs.length} audit logs. This cannot be undone.</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowClearConfirm(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button onClick={handleClearAllLogs} className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: 'var(--danger)', color: '#fff' }}>Confirm Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog isOpen={!!confirmDialog} onClose={() => setConfirmDialog(null)} onConfirm={confirmDialog?.onConfirm || (() => {})} title={confirmDialog?.title} message={confirmDialog?.message} variant="danger" confirmText="Delete" />
      <AlertDialog isOpen={!!alertDialog} onClose={() => setAlertDialog(null)} title={alertDialog?.title} message={alertDialog?.message} variant={alertDialog?.variant} />
    </DashboardLayout>
  )
}
