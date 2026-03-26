import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import DashboardLayout from '../components/DashboardLayout'
import { motion } from 'framer-motion'

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
      case 'urgent': return 'bg-black text-white border-black'
      case 'high': return 'bg-gray-800 text-white border-gray-800'
      case 'medium': return 'bg-gray-400 text-white border-gray-400'
      case 'low': return 'bg-gray-200 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-black text-white'
      case 'in_progress': return 'bg-gray-600 text-white'
      case 'blocked': return 'bg-gray-400 text-white'
      default: return 'bg-gray-200 text-gray-800'
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
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-2">My Tasks</h1>
        <p className="text-gray-600 mb-8">Tasks assigned to you</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="liquid-glass p-6">
            <p className="text-gray-600 text-sm mb-1">Total</p>
            <p className="text-3xl font-bold text-black">{stats.total}</p>
          </div>
          <div className="liquid-glass p-6">
            <p className="text-gray-600 text-sm mb-1">Pending</p>
            <p className="text-3xl font-bold text-gray-600">{stats.pending}</p>
          </div>
          <div className="liquid-glass p-6">
            <p className="text-gray-600 text-sm mb-1">In Progress</p>
            <p className="text-3xl font-bold text-gray-800">{stats.inProgress}</p>
          </div>
          <div className="liquid-glass p-6">
            <p className="text-gray-600 text-sm mb-1">Completed</p>
            <p className="text-3xl font-bold text-black">{stats.completed}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="liquid-glass p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'in_progress', 'completed', 'blocked'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === status
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <div className="liquid-glass text-center py-12">
            <p className="text-4xl mb-4">✓</p>
            <p className="text-gray-600">
              {filter === 'all' ? 'No tasks assigned to you yet' : `No ${filter.replace('_', ' ')} tasks`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="liquid-glass p-6 hover:shadow-lg transition cursor-pointer"
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Deadline:</span>
                    <p className="font-medium">
                      {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">From Meeting:</span>
                    <p className="font-medium">{task.meeting?.title || 'N/A'}</p>
                  </div>
                </div>

                {task.assignment_reason && (
                  <div className="glass-card p-3 text-sm mb-3">
                    <span className="font-medium text-black">Why assigned to you:</span>
                    <p className="text-gray-700 mt-1">{task.assignment_reason}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {task.status === 'pending' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateTaskStatus(task.id, 'in_progress')
                      }}
                      className="text-sm btn-success"
                    >
                      Start Working
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          updateTaskStatus(task.id, 'completed')
                        }}
                        className="text-sm btn-success"
                      >
                        Mark Complete
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          updateTaskStatus(task.id, 'blocked')
                        }}
                        className="text-sm btn-danger"
                      >
                        Mark Blocked
                      </button>
                    </>
                  )}
                  {task.status === 'blocked' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateTaskStatus(task.id, 'in_progress')
                      }}
                      className="text-sm btn-success"
                    >
                      Resume
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Task Detail Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="liquid-glass p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedTask.title}</h2>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-600 mt-1">{selectedTask.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Priority</label>
                    <p className={`mt-1 inline-block px-3 py-1 rounded text-sm font-medium border ${getPriorityColor(selectedTask.priority)}`}>
                      {selectedTask.priority}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <p className={`mt-1 inline-block px-3 py-1 rounded text-sm font-medium ${getStatusColor(selectedTask.status)}`}>
                      {selectedTask.status.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Deadline</label>
                  <p className="text-gray-600 mt-1">
                    {selectedTask.deadline ? new Date(selectedTask.deadline).toLocaleString() : 'Not set'}
                  </p>
                </div>

                {selectedTask.assignment_reason && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Assignment Reason</label>
                    <div className="glass-card p-3 mt-1">
                      <p className="text-gray-800 text-sm">{selectedTask.assignment_reason}</p>
                      {selectedTask.assignment_confidence && (
                        <p className="text-gray-600 text-xs mt-2">
                          Confidence: {(selectedTask.assignment_confidence * 100).toFixed(0)}%
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedTask.meeting && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">From Meeting</label>
                    <p className="text-gray-600 mt-1">{selectedTask.meeting.title}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(selectedTask.meeting.created_at).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="btn-secondary flex-1"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
