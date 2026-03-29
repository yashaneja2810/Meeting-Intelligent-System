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
  const [filters, setFilters] = useState({
    status: '',
    assigned_to: ''
  })
  const [selectedTask, setSelectedTask] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [alertDialog, setAlertDialog] = useState(null)

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
      setAlertDialog({
        title: 'Update Failed',
        message: err.message,
        variant: 'error'
      })
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
      setAlertDialog({
        title: 'Reassignment Failed',
        message: err.message,
        variant: 'error'
      })
    }
  }

  const deleteTask = async (taskId, taskTitle) => {
    setConfirmDialog({
      title: 'Delete Task',
      message: `Are you sure you want to delete "${taskTitle}"? This will permanently delete the task and all related data (logs, notifications, escalations).`,
      onConfirm: async () => {
        try {
          await api.delete(`/tasks/${taskId}`)
          loadData()
        } catch (err) {
          setAlertDialog({
            title: 'Delete Failed',
            message: err.message,
            variant: 'error'
          })
        }
      }
    })
  }

  // Ultra-premium translucent pill colors mimic top enterprise SaaS systems
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
      case 'high': return 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20'
      case 'medium': return 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20'
      case 'low': return 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/20'
      default: return 'bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-500/20'
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
      case 'in_progress': return 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
      case 'blocked': return 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20'
      case 'cancelled': return 'bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-400/20'
      default: return 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/20'
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
      <div className="max-w-[1400px] mx-auto p-6 md:p-10 lg:p-14">

        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-3">All Tasks</h1>
            <p className="text-gray-500 text-lg font-medium tracking-tight">Track, manage, and reassign tasks identified by AI.</p>
          </div>

          {/* Premium Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="relative group">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="appearance-none bg-white border border-gray-200/80 text-sm font-semibold text-gray-700 rounded-full pl-5 pr-10 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:border-gray-300 transition-all cursor-pointer"
              >
                <option value="">Status: All</option>
                <option value="pending">Status: Pending</option>
                <option value="in_progress">Status: In Progress</option>
                <option value="completed">Status: Completed</option>
                <option value="blocked">Status: Blocked</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 group-hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div className="relative group">
              <select
                value={filters.assigned_to}
                onChange={(e) => setFilters({ ...filters, assigned_to: e.target.value })}
                className="appearance-none bg-white border border-gray-200/80 text-sm font-semibold text-gray-700 rounded-full pl-5 pr-10 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:border-gray-300 transition-all cursor-pointer max-w-[200px] truncate"
              >
                <option value="">Assignee: All</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id} className="truncate">
                    Assignee: {member.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 group-hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        {tasks.length === 0 ? (
          <div className="bg-[#FAFAFA] rounded-[2rem] flex flex-col items-center justify-center p-24 text-center border border-gray-100/50">
            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-8 shadow-sm border border-gray-100">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">No tasks found</p>
            <p className="text-gray-500 font-medium">Try adjusting your filters or upload a new meeting transcript.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            <AnimatePresence>
              {tasks.map((task, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
                  key={task.id}
                  className="bg-white rounded-[1.5rem] p-8 flex flex-col shadow-[0_2px_12px_rgba(0,0,0,0.02)] ring-1 ring-gray-200/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:ring-indigo-100 transition-all duration-400 relative overflow-hidden group"
                >
                  {/* Subtle hover gradient wash */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                  <div className="relative z-10 flex flex-col h-full">
                    {/* Task Header */}
                    <div className="flex justify-between items-start mb-5 gap-6">
                      <h3 className="text-xl font-bold text-gray-900 tracking-tight leading-snug">{task.title}</h3>
                      <div className="flex flex-col gap-2 shrink-0 items-end">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase ${getStatusBadge(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase ${getPriorityBadge(task.priority)}`}>
                          {task.priority} Priority
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-[15px] mb-6 leading-relaxed flex-1 line-clamp-3">{task.description}</p>

                    {/* Metadata Section */}
                    <div className="bg-[#FAFAFA] rounded-2xl p-5 mb-6 border border-gray-100/80">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Assignee</p>
                          <p className="text-[14px] font-semibold text-gray-900 flex items-center gap-2.5">
                            <span className="w-6 h-6 bg-white rounded-md flex items-center justify-center text-[11px] font-bold border border-gray-200 shadow-sm text-gray-700">
                              {task.assigned_member?.name?.[0] || '?'}
                            </span>
                            <span className="truncate">{task.assigned_member?.name || 'Unassigned'}</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Deadline</p>
                          <p className="text-[14px] font-semibold text-gray-900 flex items-center h-6">
                            {task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Not set'}
                          </p>
                        </div>
                      </div>

                      {/* AI Reasoning - Polished block */}
                      {task.assignment_reason && (
                        <div className="mt-5 pt-5 border-t border-gray-200/60">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">AI Reasoning</span>
                            {task.assignment_confidence && (
                              <span className="ml-auto text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                {(task.assignment_confidence * 100).toFixed(0)}% Match
                              </span>
                            )}
                          </div>
                          <p className="text-[13px] text-gray-500 leading-relaxed pl-6 border-l-2 border-indigo-100 ml-1.5 py-0.5">{task.assignment_reason}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex gap-2.5">
                        <div className="relative">
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                            className="appearance-none text-[13px] font-bold bg-white border border-gray-200 rounded-full pl-4 pr-8 py-2 focus:border-indigo-500 outline-none cursor-pointer hover:bg-gray-50 transition-colors shadow-sm text-gray-700"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="blocked">Blocked</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>

                        {task.status !== 'completed' && (
                          <button
                            onClick={() => setSelectedTask(task)}
                            className="text-[13px] font-bold text-gray-600 bg-white border border-gray-200 rounded-full px-5 py-2 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                          >
                            Reassign
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => deleteTask(task.id, task.title)}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-full transition-colors focus:outline-none"
                        title="Delete task"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Reassign Modal */}
        <AnimatePresence>
          {selectedTask && (
            <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white p-8 max-w-md w-full shadow-2xl rounded-[2rem] ring-1 ring-black/5"
              >
                <div className="w-14 h-14 bg-gray-50 rounded-[1rem] flex items-center justify-center mb-6 border border-gray-100">
                  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">Reassign Task</h3>
                <p className="text-gray-500 font-medium mb-8 text-[15px]">{selectedTask.title}</p>

                <div className="mb-10">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Select New Assignee</label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-[#FAFAFA] border border-gray-200 text-[15px] font-semibold text-gray-900 rounded-xl pl-4 pr-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-gray-300 transition-colors shadow-sm cursor-pointer"
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
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="w-full bg-gray-50 text-gray-700 font-bold px-4 py-3.5 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
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
      </div>
    </DashboardLayout>
  )
}
