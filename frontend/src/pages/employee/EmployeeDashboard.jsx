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
          <h1 className="text-headline mb-3">My Workspace</h1>
          <p className="text-gray-500 text-lg font-medium tracking-tight">Track your assignments and manage your workload seamlessly.</p>
        </div>

        {/* Stats Grid - Bento Box Style */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {statCards.map((stat, idx) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              key={stat.label}
              className={`surface p-8 cursor-pointer group flex flex-col justify-between h-36 border-transparent shadow-sm hover:shadow-apple-hover ${stat.label === 'Pending Invites' && stat.value > 0 ? 'bg-black text-white' : 'bg-white text-black'}`}
              onClick={() => {
                if (stat.label === 'Organizations') navigate('/employee/organizations')
                else if (stat.label === 'Pending Invites') navigate('/employee/invites')
                else navigate('/employee/tasks')
              }}
            >
              <p className={`text-xs font-bold uppercase tracking-wider ${stat.label === 'Pending Invites' && stat.value > 0 ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
              <p className={`text-5xl font-bold tracking-tight ${stat.label === 'Pending Invites' && stat.value > 0 ? 'text-white' : 'text-black'}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions & Recent */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Quick Actions Panel */}
          <div className="space-y-6">
            <div
              className="bg-black text-white rounded-[2rem] p-8 cursor-pointer relative overflow-hidden group shadow-apple hover:-translate-y-1 transition-transform duration-300"
              onClick={() => navigate('/employee/tasks')}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-10 border border-white/10">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 tracking-tight flex items-center justify-between">
                    View Tasks
                    <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </h3>
                  <p className="text-white/70 font-medium">See what actions need attention</p>
                </div>
              </div>
            </div>

            {stats.pendingInvites > 0 && (
              <div
                className="surface p-8 cursor-pointer group hover:-translate-y-1 transition-transform duration-300 rounded-[2rem] border-transparent shadow-sm"
                onClick={() => navigate('/employee/invites')}
              >
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-10 border border-gray-100 group-hover:bg-black group-hover:text-white transition-colors duration-300 text-black">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-black mb-2 tracking-tight flex items-center justify-between">
                  Invitations
                  <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs ml-2">{stats.pendingInvites}</span>
                </h3>
                <p className="text-gray-500 font-medium">Review pending team requests</p>
              </div>
            )}
          </div>

          {/* Recent Tasks */}
          <div className="lg:col-span-2 surface p-0 overflow-hidden shadow-sm border-transparent">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-bold text-black tracking-tight">Recent Assignments</h2>
              <button
                onClick={() => navigate('/employee/tasks')}
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
                <p className="text-black font-semibold text-xl mb-2 tracking-tight">Everything is clear</p>
                <p className="text-gray-400 text-sm font-medium">No tasks assigned to you right now.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-6 hover:bg-gray-50/80 transition-colors cursor-pointer group flex flex-col justify-between"
                    onClick={() => navigate('/employee/tasks')}
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
                    {task.deadline && (
                      <div className="mt-auto pt-2 border-t border-gray-100/50 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          Due: {new Date(task.deadline).toLocaleDateString()}
                        </span>
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
