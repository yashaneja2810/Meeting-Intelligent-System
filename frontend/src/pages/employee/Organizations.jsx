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
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-[3px] border-gray-100 border-t-black rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-headline mb-3">My Organizations</h1>
          <p className="text-gray-500 font-medium tracking-tight text-lg">Workspaces you collaborate with.</p>
        </div>

        {organizations.length === 0 ? (
          <div className="surface flex flex-col items-center justify-center p-20 text-center border-transparent shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-[28px] flex items-center justify-center mb-6 border border-gray-100">
              <span className="text-4xl filter grayscale opacity-50">🏢</span>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-black tracking-tight">No Organizations Yet</h3>
            <p className="text-gray-500 font-medium">
              Accept team invitations to join organizations and start receiving tasks.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {organizations.map((org, index) => {
                const completionRate = org.totalTasks > 0 ? (org.completedTasks / org.totalTasks) * 100 : 0;
                return (
                  <motion.div
                    key={org.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="surface p-8 hover:shadow-apple-hover transition-all duration-300 border-transparent shadow-sm flex flex-col"
                  >
                    <div className="flex items-center gap-5 border-b border-gray-100 pb-6 mb-6">
                      <div className="w-16 h-16 rounded-[18px] bg-black text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                        🏢
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xl font-bold mb-1 text-black tracking-tight truncate" title={org.name}>{org.name}</h3>
                        <p className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
                          Active {new Date(org.lastActivity).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-8">
                      <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-2xl font-bold text-black tracking-tight">{org.totalTasks}</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Total</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-2xl font-bold text-gray-600 tracking-tight">{org.pendingTasks}</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Pending</p>
                      </div>
                      <div className="text-center p-3 bg-black rounded-xl shadow-md text-white">
                        <p className="text-2xl font-bold text-white tracking-tight">{org.completedTasks}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Done</p>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Progress</span>
                        <span className="text-xs font-bold text-black">
                          {completionRate.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-black h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${completionRate}%` }}
                        />
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
