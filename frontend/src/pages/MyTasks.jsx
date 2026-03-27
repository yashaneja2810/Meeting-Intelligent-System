import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import DashboardLayout from '@/components/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'

export default function MyTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedTask, setSelectedTask] = useState(null)

  useEffect(() => {
    loadTasks()
  }, [filter])

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
      case 'blocked': return 'bg-red-50 text-red-600 border-red-200'
      default: return 'bg-white text-gray-600 border-gray-200'
    }
  }

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
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
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-headline mb-3">My Tasks</h1>
          <p className="text-gray-500 text-lg font-medium tracking-tight">Your personalized action items.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="surface p-6 flex flex-col justify-between h-32 hover:-translate-y-1 transition-transform cursor-pointer" onClick={() => setFilter('all')}>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total</p>
            <p className="text-4xl font-bold text-black tracking-tight">{stats.total}</p>
          </div>
          <div className="surface p-6 flex flex-col justify-between h-32 hover:-translate-y-1 transition-transform cursor-pointer" onClick={() => setFilter('pending')}>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Pending</p>
            <p className="text-4xl font-bold text-gray-600 tracking-tight">{stats.pending}</p>
          </div>
          <div className="surface p-6 flex flex-col justify-between h-32 hover:-translate-y-1 transition-transform cursor-pointer bg-black text-white" onClick={() => setFilter('in_progress')}>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">In Progress</p>
            <p className="text-4xl font-bold text-white tracking-tight">{stats.inProgress}</p>
          </div>
          <div className="surface p-6 flex flex-col justify-between h-32 hover:-translate-y-1 transition-transform cursor-pointer" onClick={() => setFilter('completed')}>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Completed</p>
            <p className="text-4xl font-bold text-green-600 tracking-tight">{stats.completed}</p>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="flex justify-center md:justify-start mb-8">
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto max-w-full custom-scrollbar">
            {['all', 'pending', 'in_progress', 'completed', 'blocked'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${filter === status
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                  }`}
              >
                {status === 'all' ? 'All Tasks' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <div className="surface flex flex-col items-center justify-center p-20 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-[28px] flex items-center justify-center mb-6 border border-gray-100 shadow-sm">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-black tracking-tight mb-2">
              {filter === 'all' ? 'All caught up!' : `No ${filter.replace('_', ' ')} tasks`}
            </p>
            <p className="text-gray-500 font-medium">You have no tasks matching this criteria.</p>
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
                  className="surface p-8 flex flex-col hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <h3 className="text-xl font-bold text-black tracking-tight leading-tight group-hover:text-primary-600 transition-colors">{task.title}</h3>
                    <div className="flex flex-col gap-2 shrink-0 items-end">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getPriorityColor(task.priority)}`}>
                        {task.priority} Priority
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-6 leading-relaxed flex-1 line-clamp-3">{task.description}</p>

                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Deadline</p>
                      <p className="text-sm font-semibold text-black">
                        {task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Source</p>
                      <p className="text-sm font-semibold text-gray-700 truncate">{task.meeting?.title || 'External'}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-auto pt-2 justify-end" onClick={(e) => e.stopPropagation()}>
                    {task.status === 'pending' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'in_progress')}
                        className="btn-primary py-2 text-sm"
                      >
                        Start Working
                      </button>
                    )}
                    {task.status === 'in_progress' && (
                      <>
                        <button
                          onClick={() => updateTaskStatus(task.id, 'blocked')}
                          className="btn-secondary py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-100"
                        >
                          Mark Blocked
                        </button>
                        <button
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                          className="btn-primary py-2 text-sm"
                        >
                          Mark Complete
                        </button>
                      </>
                    )}
                    {task.status === 'blocked' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'in_progress')}
                        className="btn-primary py-2 text-sm"
                      >
                        Resume Task
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Task Detail Modal */}
        <AnimatePresence>
          {selectedTask && (
            <div className="fixed inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="surface p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-black/5"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shrink-0">
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-black mb-4">{selectedTask.title}</h2>

                <div className="flex flex-wrap gap-2 mb-8">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border ${getPriorityColor(selectedTask.priority)}`}>
                    {selectedTask.priority} Priority
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border ${getStatusColor(selectedTask.status)}`}>
                    {selectedTask.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-gray-700 leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100">{selectedTask.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Due Date</h4>
                      <p className="text-sm font-semibold text-black">
                        {selectedTask.deadline ? new Date(selectedTask.deadline).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Not set'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Source Meeting</h4>
                      <p className="text-sm font-semibold text-black mb-1 truncate">{selectedTask.meeting?.title || 'Unknown Source'}</p>
                      {selectedTask.meeting && (
                        <p className="text-[11px] text-gray-500">
                          {new Date(selectedTask.meeting.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedTask.assignment_reason && (
                    <div className="border border-gray-100 rounded-xl p-5 bg-white">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <h4 className="text-[11px] font-bold text-black uppercase tracking-wider">AI Assignment Reasoning</h4>
                        {selectedTask.assignment_confidence && (
                          <span className="ml-auto bg-gray-100 text-black px-2 py-0.5 rounded text-[10px] font-bold">
                            {(selectedTask.assignment_confidence * 100).toFixed(0)}% Match
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-[13px] leading-relaxed italic border-l-2 border-gray-200 pl-3">"{selectedTask.assignment_reason}"</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
