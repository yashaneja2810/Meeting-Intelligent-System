import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import DashboardLayout from '@/components/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

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

  const getAgentDetails = (agentName) => {
    if (agentName.includes('Analyzer')) return { icon: '🔍', color: 'bg-blue-50 text-blue-600 border-blue-100', bg: 'bg-blue-600' }
    if (agentName.includes('Extraction')) return { icon: '📝', color: 'bg-purple-50 text-purple-600 border-purple-100', bg: 'bg-purple-600' }
    if (agentName.includes('Assignment')) return { icon: '🎯', color: 'bg-orange-50 text-orange-600 border-orange-100', bg: 'bg-orange-600' }
    if (agentName.includes('Tracking')) return { icon: '⏰', color: 'bg-green-50 text-green-600 border-green-100', bg: 'bg-green-600' }
    if (agentName.includes('Failure')) return { icon: '⚠️', color: 'bg-red-50 text-red-600 border-red-100', bg: 'bg-red-600' }
    if (agentName.includes('Recovery')) return { icon: '🔄', color: 'bg-teal-50 text-teal-600 border-teal-100', bg: 'bg-teal-600' }
    return { icon: '🤖', color: 'bg-gray-50 text-gray-600 border-gray-100', bg: 'bg-black' }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-[3px] border-gray-100 border-t-black rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1000px] mx-auto">
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-headline mb-2">Audit Logs</h1>
            <p className="text-gray-500 font-medium tracking-tight">Complete transparency of all AI decisions and actions.</p>
          </div>

          <div className="w-full md:w-auto">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field bg-white shadow-sm border-gray-200 py-3 pr-10 w-full md:w-64 cursor-pointer hover:bg-gray-50/50 transition-colors"
            >
              <option value="">All Agents</option>
              <option value="Meeting Analyzer Agent">Meeting Analyzer</option>
              <option value="Task Extraction Agent">Task Extraction</option>
              <option value="Assignment Agent">Assignment</option>
              <option value="Tracking Agent">Tracking</option>
              <option value="Failure Detection Agent">Failure Detection</option>
              <option value="Recovery Agent">Recovery</option>
            </select>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="surface flex flex-col items-center justify-center p-20 text-center border-transparent shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-[28px] flex items-center justify-center mb-6 border border-gray-100">
              <span className="text-4xl filter grayscale opacity-50">📋</span>
            </div>
            <p className="text-2xl font-bold text-black tracking-tight mb-2">No audit logs yet</p>
            <p className="text-gray-500 font-medium">AI actions will appear here once they execute.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-8 top-8 bottom-8 w-[2px] bg-gray-100 rounded-full hidden md:block"></div>

            <div className="space-y-6 relative">
              <AnimatePresence>
                {logs.map((log, index) => {
                  const agentObj = getAgentDetails(log.agent_name)
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      key={log.id}
                      className="relative pl-0 md:pl-24"
                    >
                      {/* Timeline Dot */}
                      <div className="absolute left-[1.35rem] top-8 w-4 h-4 rounded-full border-4 border-white shadow-sm hidden md:block z-10" style={{ backgroundColor: agentObj.bg === 'bg-black' ? '#000' : 'var(--apple-primary)' }}></div>

                      <div className="surface p-6 md:p-8 hover:shadow-apple-hover transition-all duration-300 border-transparent">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mb-6">
                          <div className={`w-14 h-14 shrink-0 rounded-[18px] flex items-center justify-center text-2xl border ${agentObj.color}`}>
                            {agentObj.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-xl text-black tracking-tight mb-1">{log.action}</h3>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-gray-500">{log.agent_name}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                              <span className="text-[13px] font-medium text-gray-400">
                                {new Date(log.created_at).toLocaleString(undefined, {
                                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                          {log.confidence_score && (
                            <div className="flex flex-col items-end shrink-0 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Confidence</span>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-black tracking-tight">{(log.confidence_score * 100).toFixed(0)}%</span>
                                <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div className={`h-full ${agentObj.bg}`} style={{ width: `${log.confidence_score * 100}%` }}></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100 mb-4">
                          <h4 className="text-[11px] font-bold text-black uppercase tracking-wider mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Reasoning
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed font-medium">{log.reasoning}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          {log.input_data && Object.keys(log.input_data).length > 0 && (
                            <details className="text-sm group flex-1">
                              <summary className="cursor-pointer text-gray-500 hover:text-black font-semibold transition-colors list-none flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 hover:border-black">
                                <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                View Input Data
                              </summary>
                              <div className="mt-3 p-4 bg-[#1d1d1f] rounded-xl overflow-hidden shadow-inner">
                                <pre className="text-[11px] text-gray-300 font-mono overflow-x-auto custom-scrollbar">
                                  {JSON.stringify(log.input_data, null, 2)}
                                </pre>
                              </div>
                            </details>
                          )}

                          {log.output_data && Object.keys(log.output_data).length > 0 && (
                            <details className="text-sm group flex-1">
                              <summary className="cursor-pointer text-gray-500 hover:text-black font-semibold transition-colors list-none flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 hover:border-black">
                                <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                View Output Data
                              </summary>
                              <div className="mt-3 p-4 bg-[#1d1d1f] rounded-xl overflow-hidden shadow-inner">
                                <pre className="text-[11px] text-gray-300 font-mono overflow-x-auto custom-scrollbar">
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
    </DashboardLayout>
  )
}
