import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import DashboardLayout from '../../components/DashboardLayout'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    teamMembers: 0,
    activeMeetings: 0,
    pendingInvites: 0
  })
  const [recentTasks, setRecentTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [tasks, team, meetings, invites] = await Promise.all([
        api.get('/tasks'),
        api.get('/team'),
        api.get('/meetings'),
        api.get('/invites/sent')
      ])

      setStats({
        totalTasks: tasks.length,
        pendingTasks: tasks.filter(t => t.status === 'pending').length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        teamMembers: team.filter(m => m.invite_status === 'joined').length,
        activeMeetings: meetings.filter(m => m.processed).length,
        pendingInvites: invites.filter(i => i.status === 'pending').length
      })

      setRecentTasks(tasks.slice(0, 5))
    } catch (err) {
      console.error('Load dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'Total Tasks', value: stats.totalTasks, path: '/admin/tasks' },
    { label: 'Pending Tasks', value: stats.pendingTasks, path: '/admin/tasks' },
    { label: 'Completed', value: stats.completedTasks, path: '/admin/tasks' },
    { label: 'Team Members', value: stats.teamMembers, path: '/admin/team' },
    { label: 'Meetings Processed', value: stats.activeMeetings, path: '/admin/upload' },
    { label: 'Pending Invites', value: stats.pendingInvites, path: '/admin/invites' }
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
          <h1 className="text-4xl font-bold text-black mb-2">Organization Dashboard</h1>
          <p className="text-gray-600 text-lg">Manage your team, meetings, and tasks with AI intelligence</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="liquid-glass p-6 cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => navigate(stat.path)}
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
            onClick={() => navigate('/admin/upload')}
          >
            <div className="absolute inset-0 bg-black"></div>
            <div className="relative p-8 text-white">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">Upload Meeting</h3>
                  <p className="text-gray-300">Process a new meeting transcript with AI</p>
                </div>
              </div>
            </div>
          </div>

          <div
            className="liquid-glass p-8 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => navigate('/admin/team')}
          >
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1 text-black">Manage Team</h3>
                <p className="text-gray-600">Add members and send invitations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="liquid-glass p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">Recent Tasks</h2>
            <button
              onClick={() => navigate('/admin/tasks')}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-600 font-semibold text-lg">No tasks yet</p>
              <p className="text-gray-500 text-sm mt-1">Upload a meeting to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="glass-card p-5 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate('/admin/tasks')}
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
                  {task.assigned_member && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xs">
                        {task.assigned_member.name[0]}
                      </div>
                      <span>Assigned to: {task.assigned_member.name}</span>
                    </div>
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
