import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import DashboardLayout from '@/components/DashboardLayout'
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
        <div className="flex items-center justify-center h-screen w-full">
          <div className="w-8 h-8 border-[3px] border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto p-10 lg:p-14">
        {/* Header */}
        <div className="mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-3">Overview</h1>
          <p className="text-gray-500 text-lg font-medium tracking-tight">Manage your team, meetings, and tasks with AI intelligence.</p>
        </div>

        {/* Stats Grid - High End Bento Style */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {statCards.map((stat, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
              key={stat.label}
              className="bg-white rounded-[24px] p-7 cursor-pointer group flex flex-col justify-between h-40 shadow-[0_2px_10px_rgba(0,0,0,0.02)] ring-1 ring-gray-200/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:ring-indigo-100 transition-all duration-300 relative overflow-hidden"
              onClick={() => navigate(stat.path)}
            >
              {/* Subtle accent gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-50/50 group-hover:to-transparent transition-colors duration-500 pointer-events-none"></div>

              <div className="flex justify-between items-start relative z-10">
                <p className="text-gray-500 text-[13px] font-bold tracking-wider uppercase">{stat.label}</p>
                <div className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 duration-300 bg-white shadow-sm border border-gray-100 w-8 h-8 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              <p className="text-[3rem] font-black text-gray-900 tracking-tighter leading-none relative z-10">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Two-Column Section */}
        <div className="grid lg:grid-cols-3 gap-10">

          {/* Recent Tasks */}
          <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-[0_2px_12px_rgba(0,0,0,0.02)] ring-1 ring-gray-200/60 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#FDFDFD]">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Recent Activity</h2>
              <button
                onClick={() => navigate('/admin/tasks')}
                className="text-gray-500 font-semibold hover:text-gray-900 text-sm flex items-center gap-1.5 transition-colors bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:shadow"
              >
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {recentTasks.length === 0 ? (
              <div className="text-center py-24 px-8 bg-[#FAFAFA] flex-1 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-[1.2rem] flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-900 font-bold text-lg mb-1 tracking-tight">No tasks yet</p>
                <p className="text-gray-500 text-sm font-medium">Upload a meeting transcript to generate tasks.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 bg-[#FAFAFA]">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-6 px-8 hover:bg-white transition-colors cursor-pointer group flex flex-col gap-2"
                    onClick={() => navigate('/admin/tasks')}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 text-[16px] tracking-tight group-hover:text-indigo-600 transition-colors pr-4">{task.title}</h3>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase ring-1 ring-inset ${task.status === 'completed' ? 'bg-emerald-50 text-emerald-700 ring-emerald-500/20' :
                          task.status === 'in_progress' ? 'bg-blue-50 text-blue-700 ring-blue-500/20' :
                            'bg-amber-50 text-amber-700 ring-amber-500/20'
                        }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[14px] text-gray-500 line-clamp-1 font-medium leading-relaxed">{task.description}</p>
                    {task.assigned_member && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center text-gray-700 font-bold text-[10px] border border-gray-200">
                          {task.assigned_member.name[0]}
                        </div>
                        <span className="text-[12px] text-gray-400 font-medium">{task.assigned_member.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="space-y-6">

            {/* Ultra Premium "New Meeting" Card */}
            <div
              className="bg-gray-900 rounded-[2rem] p-8 cursor-pointer relative overflow-hidden group shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-transform duration-300"
              onClick={() => navigate('/admin/upload')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-gray-900 mix-blend-overlay"></div>
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-bl from-indigo-500/40 to-purple-500/40 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-700"></div>

              <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-10 border border-white/20 shadow-inner group-hover:bg-white/20 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-white mb-1.5 tracking-tight flex items-center justify-between">
                    New Meeting
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </h3>
                  <p className="text-white/60 font-medium text-sm">Upload & process transcript with AI</p>
                </div>
              </div>
            </div>

            {/* Sub-action card */}
            <div
              className="bg-white p-8 cursor-pointer group hover:-translate-y-1 transition-transform duration-300 rounded-[2rem] ring-1 ring-gray-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-lg"
              onClick={() => navigate('/admin/team')}
            >
              <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mb-8 border border-gray-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors duration-300">
                <svg className="w-6 h-6 text-gray-700 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1.5 tracking-tight flex items-center justify-between">
                Invite Team
                <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </h3>
              <p className="text-gray-500 font-medium text-sm">Grow your organization workspace</p>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  )
}
