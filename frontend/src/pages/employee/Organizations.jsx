import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import DashboardLayout from '@/components/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'

export default function Organizations() {
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrganizations()
  }, [])

  const loadOrganizations = async () => {
    try {
      // Get all tasks to find organizations
      const tasks = await api.get('/my-tasks')

      // Group by organization
      const orgMap = new Map()

      for (const task of tasks) {
        const orgKey = task.user_id
        if (!orgMap.has(orgKey)) {
          orgMap.set(orgKey, {
            id: orgKey,
            name: 'Partner Organization', // We'd ideally fetch real name
            totalTasks: 0,
            pendingTasks: 0,
            completedTasks: 0,
            lastActivity: task.created_at
          })
        }

        const org = orgMap.get(orgKey)
        org.totalTasks++
        if (task.status === 'pending') org.pendingTasks++
        if (task.status === 'completed') org.completedTasks++
        if (new Date(task.created_at) > new Date(org.lastActivity)) {
          org.lastActivity = task.created_at
        }
      }

      setOrganizations(Array.from(orgMap.values()))
    } catch (err) {
      console.error('Load organizations error:', err)
    } finally {
      setLoading(false)
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
      <div className="max-w-[1200px] mx-auto p-6 md:p-10 lg:p-14">

        {/* Header Section */}
        <div className="mb-14 text-center md:text-left flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-3">My Organizations</h1>
            <p className="text-gray-500 text-lg font-medium tracking-tight">Workspaces you collaborate with.</p>
          </div>
        </div>

        {organizations.length === 0 ? (
          <div className="bg-[#FAFAFA] rounded-[2rem] flex flex-col items-center justify-center p-24 text-center border border-gray-100/50">
            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-8 shadow-sm border border-gray-100">
              <span className="text-4xl filter grayscale opacity-50">🏢</span>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">No Organizations Yet</h3>
            <p className="text-gray-500 font-medium">
              Accept team invitations to join organizations and start receiving tasks.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {organizations.map((org, index) => {
                const completionRate = org.totalTasks > 0 ? (org.completedTasks / org.totalTasks) * 100 : 0;
                return (
                  <motion.div
                    key={org.id}
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-white rounded-[1.5rem] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] ring-1 ring-gray-200/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:ring-indigo-100 transition-all duration-400 relative overflow-hidden group flex flex-col"
                  >
                    {/* Subtle hover wash */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center gap-5 border-b border-gray-100 pb-6 mb-6">
                        <div className="w-16 h-16 rounded-[1.2rem] bg-gray-900 text-white flex items-center justify-center shadow-lg border border-gray-800 shrink-0 group-hover:scale-105 transition-transform duration-300">
                          <svg className="w-8 h-8 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xl font-extrabold mb-1.5 text-gray-900 tracking-tight truncate group-hover:text-indigo-600 transition-colors" title={org.name}>{org.name}</h3>
                          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                            Active {new Date(org.lastActivity).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-8">
                        <div className="text-center p-3 bg-[#FAFAFA] rounded-[1rem] border border-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
                          <p className="text-2xl font-black text-gray-900 tracking-tight">{org.totalTasks}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total</p>
                        </div>
                        <div className="text-center p-3 bg-[#FAFAFA] rounded-[1rem] border border-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
                          <p className="text-2xl font-black text-gray-500 tracking-tight">{org.pendingTasks}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Pending</p>
                        </div>
                        <div className="text-center p-3 bg-emerald-50 rounded-[1rem] ring-1 ring-inset ring-emerald-500/20">
                          <p className="text-2xl font-black text-emerald-600 tracking-tight">{org.completedTasks}</p>
                          <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Done</p>
                        </div>
                      </div>

                      <div className="mt-auto pt-5 border-t border-gray-100/80">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Completion</span>
                          <span className="text-[12px] font-black text-gray-900">
                            {completionRate.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${completionRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
