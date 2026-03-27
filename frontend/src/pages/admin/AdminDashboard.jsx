import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api.js'
import DashboardLayout from '../../components/DashboardLayout.jsx'
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
          <div className="w-10 h-10 border-[3px] border-gray-100 border-t-black rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-headline mb-3">Overview</h1>
          <p className="text-gray-500 text-lg font-medium tracking-tight">Manage your team, meetings, and tasks with AI intelligence.</p>
        </div>

        {/* Stats Grid - Bento Box Style */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {statCards.map((stat, idx) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              key={stat.label}
              className="surface p-8 cursor-pointer group flex flex-col justify-between h-36"
              onClick={() => navigate(stat.path)}
            >
              <div className="flex justify-between items-start">
                <p className="text-gray-500 text-sm font-semibold tracking-wide uppercase">{stat.label}</p>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 duration-300">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              <p className="text-5xl font-bold text-black tracking-tight">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Two-Column Section */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Recent Tasks */}
          <div className="lg:col-span-2 surface p-0 overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-bold text-black tracking-tight">Recent Activity</h2>
              <button
                onClick={() => navigate('/admin/tasks')}
                className="text-black font-semibold hover:text-gray-500 text-sm flex items-center gap-1 transition-colors"
              >
                View All
                <svg className="w-4 h-4 mt-[1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {recentTasks.length === 0 ? (
              <div className="text-center py-20 px-8">
                <div className="w-20 h-20 bg-gray-50 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                  <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-black font-semibold text-xl mb-2 tracking-tight">No tasks yet</p>
                <p className="text-gray-400 text-sm font-medium">Upload a meeting to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-6 hover:bg-gray-50/80 transition-colors cursor-pointer group"
                    onClick={() => navigate('/admin/tasks')}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-black text-lg tracking-tight group-hover:text-primary-600 transition-colors">{task.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase shadow-sm border ${task.status === 'completed' ? 'bg-black text-white border-black' :
                          task.status === 'in_progress' ? 'bg-white text-black border-gray-200' :
                            'bg-gray-50 text-gray-500 border-gray-200'
                        }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-1">{task.description}</p>
                    {task.assigned_member && (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-black font-bold text-xs border border-gray-200">
                          {task.assigned_member.name[0]}
                        </div>
                        <span className="text-xs text-gray-500 font-medium">{task.assigned_member.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="space-y-6">
            <div
              className="bg-black text-white rounded-[2rem] p-8 cursor-pointer relative overflow-hidden group shadow-apple hover:-translate-y-1 transition-transform duration-300"
              onClick={() => navigate('/admin/upload')}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-10 border border-white/10">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 tracking-tight flex items-center justify-between">
                    New Meeting
                    <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </h3>
                  <p className="text-white/70 font-medium">Process transcript with AI</p>
                </div>
              </div>
            </div>

            <div
              className="surface p-8 cursor-pointer group hover:-translate-y-1 transition-transform duration-300 rounded-[2rem]"
              onClick={() => navigate('/admin/team')}
            >
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-10 border border-gray-100 group-hover:bg-black group-hover:text-white transition-colors duration-300 text-black">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-2 tracking-tight flex items-center justify-between">
                Invite Team
                <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-all text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </h3>
              <p className="text-gray-500 font-medium">Grow your organization</p>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  )
}
