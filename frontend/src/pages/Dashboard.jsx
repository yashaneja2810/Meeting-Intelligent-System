import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import DashboardLayout from '../components/DashboardLayout'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    teamMembers: 0
  })
  const [recentTasks, setRecentTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [tasks, team] = await Promise.all([
        api.get('/tasks'),
        api.get('/team')
      ])

      setStats({
        totalTasks: tasks.length,
        pendingTasks: tasks.filter(t => t.status === 'pending').length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        teamMembers: team.length
      })

      setRecentTasks(tasks.slice(0, 5))
    } catch (err) {
      console.error('Load dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'Total Tasks', value: stats.totalTasks },
    { label: 'Pending Activity', value: stats.pendingTasks },
    { label: 'Completed', value: stats.completedTasks },
    { label: 'Team Members', value: stats.teamMembers }
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
        <div className="mb-12">
          <h1 className="text-headline mb-3">Admin Dashboard</h1>
          <p className="text-gray-500 text-lg font-medium tracking-tight">Overview of your organization's automated workflow.</p>
        </div>

        {/* Stats Grid - Bento Box Style */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="surface p-8 flex flex-col justify-between h-36 hover:shadow-apple-hover transition-all duration-300 border-transparent cursor-pointer group"
              onClick={() => {
                if (stat.label === 'Team Members') navigate('/dashboard/team')
                else navigate('/dashboard/tasks')
              }}
            >
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-500 transition-colors">{stat.label}</p>
              <p className="text-5xl font-bold text-black tracking-tight">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions & Recent Tasks Split */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Quick Actions */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black text-white rounded-[2rem] p-8 cursor-pointer relative overflow-hidden group shadow-apple hover:-translate-y-1 transition-transform duration-300 h-[280px]"
              onClick={() => navigate('/dashboard/upload')}
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-2 tracking-tight">Upload Meeting</h3>
                  <p className="text-white/70 font-medium text-lg leading-snug">Process a new transcript and let AI extract action items instantly.</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="surface p-8 cursor-pointer group hover:-translate-y-1 transition-transform duration-300 rounded-[2rem] border-transparent shadow-sm flex items-center gap-6"
              onClick={() => navigate('/dashboard/team')}
            >
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:bg-black group-hover:text-white transition-colors duration-300 text-black shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-black mb-1 tracking-tight">Add Team</h3>
                <p className="text-gray-500 font-medium text-sm">Expand your workforce</p>
              </div>
            </motion.div>
          </div>

          {/* Recent Tasks */}
          <div className="lg:col-span-2 surface p-0 overflow-hidden shadow-sm border-transparent flex flex-col">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-bold text-black tracking-tight">Recent Activity</h2>
              <button
                onClick={() => navigate('/dashboard/tasks')}
                className="text-black font-semibold hover:text-gray-500 text-sm flex items-center gap-1 transition-colors"
              >
                View All
                <svg className="w-4 h-4 mt-[1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {recentTasks.length === 0 ? (
              <div className="text-center py-20 px-8 flex-1 flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-gray-50 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                  <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-black font-semibold text-xl mb-2 tracking-tight">No tasks yet</p>
                <p className="text-gray-400 text-sm font-medium">Upload a meeting transcript to let AI create tasks.</p>
                <button
                  onClick={() => navigate('/dashboard/upload')}
                  className="mt-6 btn-primary px-6 py-2"
                >
                  Upload First Meeting
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 flex-1 overflow-auto custom-scrollbar">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-6 hover:bg-gray-50/80 transition-colors cursor-pointer group flex flex-col justify-between"
                    onClick={() => navigate('/dashboard/tasks')}
                  >
                    <div className="flex justify-between items-start mb-2 gap-4">
                      <h3 className="font-semibold text-black text-lg tracking-tight group-hover:text-primary-600 transition-colors line-clamp-1">{task.title}</h3>
                      <span className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase shadow-sm border ${task.status === 'completed' ? 'bg-black text-white border-black' :
                          task.status === 'in_progress' ? 'bg-white text-black border-gray-200' :
                            'bg-gray-50 text-gray-500 border-gray-200'
                        }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mb-4 line-clamp-1">{task.description}</p>

                    {task.assigned_member ? (
                      <div className="mt-auto pt-3 border-t border-gray-100/50 flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm">
                          {task.assigned_member.name[0].toUpperCase()}
                        </div>
                        <span>Assigned to <span className="text-black font-semibold">{task.assigned_member.name}</span></span>
                      </div>
                    ) : (
                      <div className="mt-auto pt-3 border-t border-gray-100/50 flex items-center gap-2 text-sm text-gray-400 font-medium italic">
                        Unassigned
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
