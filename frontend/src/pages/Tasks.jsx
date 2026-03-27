import { useEffect, useState } from 'react'
import { api } from '@/lib/api.js'
import DashboardLayout from '@/components/DashboardLayout.jsx'
import { motion, AnimatePresence } from 'framer-motion'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    assigned_to: ''
  })
  const [selectedTask, setSelectedTask] = useState(null)

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.assigned_to) params.append('assigned_to', filters.assigned_to)

      const [tasksData, teamData] = await Promise.all([
        api.get(`/tasks?${params}`),
        api.get('/team')
      ])

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
      alert(err.message)
    }
  }

  const reassignTask = async (taskId, assignedTo) => {
    try {
      await api.post(`/tasks/${taskId}/reassign`, {
        assigned_to: assignedTo,
        reason: 'Manual reassignment by user'
      })
      loadData()
      setSelectedTask(null)
    } catch (err) {
      alert(err.message)
    }
  }

  const deleteTask = async (taskId, taskTitle) => {
    if (!confirm(`Are you sure you want to delete "${taskTitle}"?\n\nThis will permanently delete the task and all related data (logs, notifications, escalations).`)) {
      return
    }

    try {
      await api.delete(`/tasks/${taskId}`)
      loadData()
    } catch (err) {
      alert(err.message)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50 text-red-600 border-red-200'
      case 'high': return 'bg-orange-50 text-orange-600 border-orange-200'
      case 'medium': return 'bg-yellow-50 text-yellow-600 border-yellow-200'
      case 'low': return 'bg-gray-50 text-gray-600 border-gray-200'
      default: return 'bg-gray-50 text-gray-500 border-gray-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-black text-white border-black'
      case 'in_progress': return 'bg-white text-black border-gray-200 shadow-sm'
      case 'blocked': return 'bg-gray-100 text-gray-500 border-gray-200'
      case 'cancelled': return 'bg-gray-50 text-gray-400 border-transparent'
      default: return 'bg-white text-gray-600 border-gray-200'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-[3px] border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h1 className="text-headline mb-3">All Tasks</h1>
            <p className="text-gray-500 font-medium tracking-tight">Track, manage, and reassign tasks identified by AI.</p>
          </div>

          {/* Filters - Apple Style Segmented Look */}
          <div className="flex gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="bg-transparent border-none text-sm font-medium text-gray-600 focus:ring-0 outline-none pr-8 cursor-pointer hover:text-black transition-colors"
            >
              <option value="">Status: All</option>
              <option value="pending">Status: Pending</option>
              <option value="in_progress">Status: In Progress</option>
              <option value="completed">Status: Completed</option>
              <option value="blocked">Status: Blocked</option>
            </select>

            <div className="w-px bg-gray-200 my-1"></div>

            <select
              value={filters.assigned_to}
              onChange={(e) => setFilters({ ...filters, assigned_to: e.target.value })}
              className="bg-transparent border-none text-sm font-medium text-gray-600 focus:ring-0 outline-none pr-8 cursor-pointer hover:text-black transition-colors"
            >
              <option value="">Assignee: All</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  Assignee: {member.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tasks Grid */}
        {tasks.length === 0 ? (
          <div className="surface flex flex-col items-center justify-center p-20 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-[28px] flex items-center justify-center mb-6 border border-gray-100 shadow-sm">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-black tracking-tight mb-2">No tasks found</p>
            <p className="text-gray-500 font-medium">Try adjusting your filters or upload a new meeting.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <AnimatePresence>
              {tasks.map((task, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={task.id}
                  className="surface p-8 flex flex-col hover:-translate-y-1 transition-transform duration-300"
                >
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <h3 className="text-xl font-bold text-black tracking-tight leading-tight">{task.title}</h3>
                    <div className="flex flex-col gap-2 shrink-0 items-end">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getPriorityColor(task.priority)}`}>
                        {task.priority} Priority
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-6 leading-relaxed flex-1">{task.description}</p>

                  <div className="bg-gray-50/80 rounded-2xl p-4 mb-6 border border-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Assignee</p>
                        <p className="text-sm font-semibold text-black flex items-center gap-2">
                          <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] border border-gray-200">
                            {task.assigned_member?.name?.[0] || '?'}
                          </span>
                          {task.assigned_member?.name || 'Unassigned'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Deadline</p>
                        <p className="text-sm font-semibold text-black">
                          {task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Not set'}
                        </p>
                      </div>
                    </div>

                    {task.assignment_reason && (
                      <div className="mt-4 pt-4 border-t border-gray-200/60">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-3.5 h-3.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="text-[11px] font-bold text-black uppercase tracking-wider">AI Reasoning</span>
                          {task.assignment_confidence && (
                            <span className="ml-auto text-[10px] font-bold text-gray-400">
                              {(task.assignment_confidence * 100).toFixed(0)}% Match
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] text-gray-600 leading-relaxed">{task.assignment_reason}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex gap-2">
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        className="text-xs font-semibold bg-white border border-gray-200 rounded-full px-3 py-1.5 focus:border-black outline-none cursor-pointer hover:border-gray-300 transition-colors"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="blocked">Blocked</option>
                      </select>
                      {task.status !== 'completed' && (
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-full px-4 py-1.5 hover:bg-gray-50 hover:text-black transition-colors"
                        >
                          Reassign
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => deleteTask(task.id, task.title)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                      title="Delete task"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Reassign Modal */}
        <AnimatePresence>
          {selectedTask && (
            <div className="fixed inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="surface p-8 max-w-md w-full shadow-2xl ring-1 ring-black/5"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-black mb-2">Reassign Task</h3>
                <p className="text-gray-500 font-medium mb-6 text-sm">{selectedTask.title}</p>

                <div className="mb-8">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Select Assignee</label>
                  <select
                    className="input-field"
                    onChange={(e) => {
                      if (e.target.value) {
                        reassignTask(selectedTask.id, e.target.value)
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Select team member...</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} — {member.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
