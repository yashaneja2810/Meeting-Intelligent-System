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

  useEffect(() => {
    loadLogs()
  }, [filter])

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
          console.error('Delete log error:', err)
          setAlertDialog({
            title: 'Delete Failed',
            message: 'Failed to delete log. Please try again.',
            variant: 'error'
          })
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
      console.error('Clear logs error:', err)
      setAlertDialog({
        title: 'Clear Failed',
        message: 'Failed to clear logs. Please try again.',
        variant: 'error'
      })
    }
  }

  const getAgentDetails = (agentName) => {
    if (agentName.includes('Analyzer')) return {
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
      color: 'bg-[#1A1A24] text-blue-400 ring-1 ring-inset ring-blue-500/30', bg: 'bg-blue-500'
    }
    if (agentName.includes('Extraction')) return {
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
      color: 'bg-[#1A1A24] text-purple-400 ring-1 ring-inset ring-purple-500/30', bg: 'bg-purple-500'
    }
    if (agentName.includes('Assignment')) return {
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      color: 'bg-[#1A1A24] text-orange-400 ring-1 ring-inset ring-orange-500/30', bg: 'bg-orange-500'
    }
    if (agentName.includes('Tracking')) return {
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      color: 'bg-[#1A1A24] text-emerald-400 ring-1 ring-inset ring-emerald-500/30', bg: 'bg-emerald-500'
    }
    if (agentName.includes('Failure')) return {
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
      color: 'bg-[#1A1A24] text-rose-400 ring-1 ring-inset ring-rose-500/30', bg: 'bg-rose-500'
    }
    if (agentName.includes('Recovery')) return {
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
      color: 'bg-[#1A1A24] text-teal-400 ring-1 ring-inset ring-teal-500/30', bg: 'bg-teal-500'
    }
    return {
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
      color: 'bg-[#1A1A24] text-gray-300 ring-1 ring-inset ring-white/20', bg: 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen w-full">
          <div className="w-8 h-8 border-[3px] border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto p-6 md:p-10 lg:p-14">

        {/* Header Area */}
        <div className="mb-14 text-center md:text-left flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-3">Audit Logs</h1>
            <p className="text-gray-500 text-lg font-medium tracking-tight">Complete transparency of all AI decisions, context, and framework actions.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative group w-full sm:w-[280px]">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200/80 text-sm font-semibold text-gray-700 rounded-full pl-5 pr-10 py-3.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:border-gray-300 transition-all cursor-pointer"
              >
                <option value="">All Agents</option>
                <option value="Meeting Analyzer Agent">Meeting Analyzer</option>
                <option value="Task Extraction Agent">Task Extraction</option>
                <option value="Assignment Agent">Assignment</option>
                <option value="Tracking Agent">Tracking</option>
                <option value="Failure Detection Agent">Failure Detection</option>
                <option value="Recovery Agent">Recovery</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            {logs.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-6 py-3.5 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 font-bold rounded-full transition-all duration-300 shadow-sm whitespace-nowrap border border-rose-200"
              >
                Clear Logs
              </button>
            )}
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="bg-[#FAFAFA] rounded-[2rem] flex flex-col items-center justify-center p-24 text-center border border-gray-100/50">
            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-8 shadow-sm border border-gray-100">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">No audit logs yet</p>
            <p className="text-gray-500 font-medium">AI framework actions will appear here once executed.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-8 top-12 bottom-12 w-px bg-gray-200 hidden md:block"></div>

            <div className="space-y-10 relative">
              <AnimatePresence>
                {logs.map((log, index) => {
                  const agentObj = getAgentDetails(log.agent_name)
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                      key={log.id}
                      className="relative pl-0 md:pl-24 group"
                    >
                      {/* Timeline Dot */}
                      <div className="absolute left-[1.6rem] top-10 w-3.5 h-3.5 rounded-full border-[3px] border-white shadow-sm hidden md:block z-10" style={{ backgroundColor: agentObj.bg === 'bg-gray-900' ? '#111827' : 'var(--apple-primary)' }}></div>

                      <div className="bg-white rounded-[1.5rem] p-8 md:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.02)] ring-1 ring-gray-200/60 transition-all duration-400 relative overflow-hidden">

                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
                          {/* Professional SVG Icon Block */}
                          <div className={`w-14 h-14 shrink-0 rounded-[1.25rem] flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] ${agentObj.color}`}>
                            {agentObj.icon}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-extrabold text-xl text-gray-900 tracking-tight mb-2">{log.action}</h3>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-[11px] font-mono tracking-widest uppercase bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{log.agent_name}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                              <span className="text-[13px] font-mono text-gray-400">
                                {new Date(log.created_at).toLocaleString(undefined, {
                                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-4 md:mt-0">
                            {log.confidence_score && (
                              <div className="flex flex-col items-end shrink-0 bg-[#FAFAFA] px-4 py-3 rounded-2xl border border-gray-100 shadow-sm">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Confidence</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-[16px] font-black font-mono text-gray-900 tracking-tighter leading-none">{(log.confidence_score * 100).toFixed(0)}%</span>
                                  <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className={`h-full ${agentObj.bg}`} style={{ width: `${log.confidence_score * 100}%` }}></div>
                                  </div>
                                </div>
                              </div>
                            )}

                            <button
                              onClick={() => handleDeleteLog(log.id)}
                              disabled={deletingId === log.id}
                              className="p-3 rounded-xl bg-white border border-gray-200 hover:border-rose-500 hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group-hover:opacity-100 opacity-0 md:opacity-100 shadow-sm"
                              title="Delete log"
                            >
                              {deletingId === log.id ? (
                                <div className="w-4 h-4 border-[2px] border-gray-200 border-t-rose-500 rounded-full animate-spin"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Terminal-Inspired Reasoning Block */}
                        <div className="bg-[#0D0D12] rounded-[1.25rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.1)] ring-1 ring-white/10 mb-6">
                          <div className="flex items-center justify-between px-5 py-3.5 bg-[#17171F] border-b border-white/5 relative">
                            <div className="flex gap-2 relative z-10">
                              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"></div>
                              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"></div>
                              <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"></div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[11px] font-mono text-gray-400/80 tracking-widest flex items-center gap-2">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                REASONING_OUTPUT.log
                              </span>
                            </div>
                          </div>
                          <div className="p-6 font-mono text-[13px] leading-relaxed">
                            <p className="text-[#4AF626] drop-shadow-[0_0_8px_rgba(74,246,38,0.2)] line-clamp-3">
                              <span className="text-gray-600 select-none mr-3">{'>'}</span>
                              {log.reasoning}
                            </p>
                          </div>
                        </div>

                        {/* Data Inspection Blocks */}
                        <div className="flex flex-col md:flex-row gap-4">
                          {log.input_data && Object.keys(log.input_data).length > 0 && (
                            <details className="text-sm flex-1 cursor-pointer group/details list-none">
                              <summary className="font-bold transition-colors list-none flex items-center gap-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-5 py-3.5 hover:bg-gray-100 hover:text-gray-900 outline-none shadow-sm">
                                <svg className="w-4 h-4 transition-transform group-open/details:rotate-90 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                                Inspect Input Event
                              </summary>
                              <div className="mt-3 p-5 bg-[#0D0D12] rounded-[1.25rem] overflow-hidden ring-1 ring-white/10 shadow-inner">
                                <pre className="text-[12px] text-gray-300 font-mono overflow-x-auto custom-scrollbar leading-loose">
                                  {JSON.stringify(log.input_data, null, 2)}
                                </pre>
                              </div>
                            </details>
                          )}

                          {log.output_data && Object.keys(log.output_data).length > 0 && (
                            <details className="text-sm flex-1 cursor-pointer group/details list-none">
                              <summary className="font-bold transition-colors list-none flex items-center gap-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-5 py-3.5 hover:bg-gray-100 hover:text-gray-900 outline-none shadow-sm">
                                <svg className="w-4 h-4 transition-transform group-open/details:rotate-90 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                                Inspect Output Payloads
                              </summary>
                              <div className="mt-3 p-5 bg-[#0D0D12] rounded-[1.25rem] overflow-hidden ring-1 ring-white/10 shadow-inner">
                                <pre className="text-[12px] text-gray-300 font-mono overflow-x-auto custom-scrollbar leading-loose">
                                  {JSON.stringify(log.output_data, null, 2)}
                                </pre>
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

      {/* Clear All Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white max-w-md w-full p-8 rounded-[2rem] shadow-2xl ring-1 ring-black/5"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-[1.2rem] flex items-center justify-center mb-6 border border-rose-100">
                <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>

              <h3 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">Clear All Logs?</h3>
              <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                This will permanently delete all {logs.length} audit log{logs.length !== 1 ? 's' : ''}. This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-6 py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors border border-gray-200 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAllLogs}
                  className="flex-1 px-6 py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!confirmDialog}
        onClose={() => setConfirmDialog(null)}
        onConfirm={confirmDialog?.onConfirm || (() => {})}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        variant="danger"
        confirmText="Delete"
      />

      <AlertDialog
        isOpen={!!alertDialog}
        onClose={() => setAlertDialog(null)}
        title={alertDialog?.title}
        message={alertDialog?.message}
        variant={alertDialog?.variant}
      />
    </DashboardLayout>
  )
}
