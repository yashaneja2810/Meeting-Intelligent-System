import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import DashboardLayout from '../../components/DashboardLayout'
import { motion } from 'framer-motion'

export default function EmployeeDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    organizations: 0,
    pendingInvites: 0
  })
  const [recentTasks, setRecentTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [tasks, invites] = await Promise.all([
        api.get('/my-tasks'),
        api.get('/invites/received')
      ])

      const orgs = new Set()
      tasks.forEach(task => {
        if (task.user_id) orgs.add(task.user_id)
      })

      setStats({
        totalTasks: tasks.length,
        pendingTasks: tasks.filter(t => t.status === 'pending').length,
        inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        organizations: orgs.size,
        pendingInvites: invites.length
      })

      setRecentTasks(tasks.slice(0, 5))
    } catch (err) {
      console.error('Load dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'My Tasks', value: stats.totalTasks },
    { label: 'Pending', value: stats.pendingTasks },
    { label: 'In Progress', value: stats.inProgressTasks },
    { label: 'Completed', value: stats.completedTasks },
    { label: 'Organizations', value: stats.organizations },
    { label: 'Pending Invites', value: stats.pendingInvites }
  ]

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">My Workspace</h1>
          <p className="text-gray-600 text-lg">Track your tasks and manage your work</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="liquid-glass p-6 hover:shadow-xl transition-shadow"
            >
              <p className="text-gray-600 text-sm mb-3 font-medium">{stat.label}</p>
              <p className="text-5xl font-bold text-black">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div
            className="relative overflow-hidden rounded-2xl cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => navigate('/employee/tasks')}
          >
            <div className="absolute inset-0 bg-black"></div>
            <div className="relative p-8 text-white">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">View My Tasks</h3>
                  <p className="text-gray-300">See all tasks assigned to you</p>
                </div>
              </div>
            </div>
          </div>

          {stats.pendingInvites > 0 && (
            <div
              className="liquid-glass p-8 cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => navigate('/employee/invites')}
            >
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1 text-black">Pending Invitations</h3>
                  <p className="text-gray-600">You have {stats.pendingInvites} invitation{stats.pendingInvites > 1 ? 's' : ''} waiting</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="liquid-glass p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">Recent Tasks</h2>
            <button
              onClick={() => navigate('/employee/tasks')}
              className="text-black font-semibold hover:underline text-sm flex items-center gap-2"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {recentTasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <p className="text-gray-600 font-semibold text-lg">No tasks assigned yet</p>
              <p className="text-gray-500 text-sm mt-1">Accept team invitations to start receiving tasks</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="glass-card p-5 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate('/employee/tasks')}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-black">{task.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                      task.status === 'completed' ? 'bg-black text-white' :
                      task.status === 'in_progress' ? 'bg-gray-200 text-black' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                  {task.deadline && (
                    <p className="text-xs text-gray-500">
                      Due: {new Date(task.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
