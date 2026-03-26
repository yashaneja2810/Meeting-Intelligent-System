import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import DashboardLayout from '../components/DashboardLayout'
import { motion } from 'framer-motion'

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

  const getAgentIcon = (agentName) => {
    if (agentName.includes('Analyzer')) return '🔍'
    if (agentName.includes('Extraction')) return '📝'
    if (agentName.includes('Assignment')) return '🎯'
    if (agentName.includes('Tracking')) return '⏰'
    if (agentName.includes('Failure')) return '⚠️'
    if (agentName.includes('Recovery')) return '🔄'
    return '🤖'
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-2">Audit Logs</h1>
        <p className="text-gray-600 mb-8">
          Complete transparency of all AI decisions and actions
        </p>

        {/* Filter */}
        <div className="liquid-glass p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Agent
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field max-w-md"
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

        {/* Logs Timeline */}
        {logs.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-gray-600">No audit logs yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="liquid-glass p-6 hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">
                    {getAgentIcon(log.agent_name)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{log.action}</h3>
                        <p className="text-sm text-gray-500">{log.agent_name}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Reasoning:</p>
                      <p className="text-sm text-gray-600">{log.reasoning}</p>
                    </div>

                    {log.confidence_score && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Confidence:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                            <div
                              className="bg-black h-2 rounded-full"
                              style={{ width: `${log.confidence_score * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {(log.confidence_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    )}

                    {log.input_data && Object.keys(log.input_data).length > 0 && (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-black hover:underline mb-2 font-medium">
                          View Input Data
                        </summary>
                        <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.input_data, null, 2)}
                        </pre>
                      </details>
                    )}

                    {log.output_data && Object.keys(log.output_data).length > 0 && (
                      <details className="text-sm mt-2">
                        <summary className="cursor-pointer text-black hover:underline mb-2 font-medium">
                          View Output Data
                        </summary>
                        <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.output_data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
