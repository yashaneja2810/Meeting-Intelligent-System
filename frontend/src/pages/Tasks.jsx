import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import DashboardLayout from '../components/DashboardLayout'
import { motion } from 'framer-motion'

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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-black text-white'
      case 'high': return 'bg-gray-800 text-white'
      case 'medium': return 'bg-gray-400 text-white'
      case 'low': return 'bg-gray-200 text-gray-800'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-black text-white'
      case 'in_progress': return 'bg-gray-600 text-white'
      case 'blocked': return 'bg-gray-400 text-white'
      case 'cancelled': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-200 text-gray-800'
    }
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
        <h1 className="text-3xl font-bold mb-8">Tasks</h1>

        {/* Filters */}
        <div className="liquid-glass p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="input-field"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned To
              </label>
              <select
                value={filters.assigned_to}
                onChange={(e) => setFilters({ ...filters, assigned_to: e.target.value })}
                className="input-field"
              >
                <option value="">All Team Members</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <div className="liquid-glass text-center py-12">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-gray-600">No tasks found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="liquid-glass p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Assigned to:</span>
                    <p className="font-medium">
                      {task.assigned_member?.name || 'Unassigned'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Deadline:</span>
                    <p className="font-medium">
                      {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>

                {task.assignment_reason && (
                  <div className="glass-card p-3 mb-4 text-sm">
                    <span className="font-medium text-black">AI Assignment Reason:</span>
                    <p className="text-gray-700 mt-1">{task.assignment_reason}</p>
                    {task.assignment_confidence && (
                      <p className="text-gray-600 text-xs mt-1">
                        Confidence: {(task.assignment_confidence * 100).toFixed(0)}%
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  {task.status !== 'completed' && (
                    <>
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-3 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="blocked">Blocked</option>
                      </select>
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="text-sm text-black hover:underline font-medium"
                      >
                        Reassign
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Reassign Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="liquid-glass p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-semibold mb-4">Reassign Task</h3>
              <p className="text-gray-600 mb-4">{selectedTask.title}</p>
              <select
                className="input-field mb-4"
                onChange={(e) => {
                  if (e.target.value) {
                    reassignTask(selectedTask.id, e.target.value)
                  }
                }}
              >
                <option value="">Select team member...</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
              <button
                onClick={() => setSelectedTask(null)}
                className="btn-secondary w-full"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
