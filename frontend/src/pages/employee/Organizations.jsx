import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import DashboardLayout from '../../components/DashboardLayout'
import { motion } from 'framer-motion'

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
            name: 'Organization', // We'll need to fetch this
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
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-2">My Organizations</h1>
        <p className="text-gray-600 mb-8">Organizations you're part of</p>

        {organizations.length === 0 ? (
          <div className="liquid-glass p-8 text-center py-16">
            <p className="text-6xl mb-4">🏢</p>
            <h3 className="text-xl font-semibold mb-2 text-black">No Organizations Yet</h3>
            <p className="text-gray-600 mb-6">
              Accept team invitations to join organizations and start receiving tasks
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {organizations.map((org, index) => (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="liquid-glass p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-black flex items-center justify-center text-3xl">
                    🏢
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1 text-black">{org.name}</h3>
                    <p className="text-sm text-gray-500">
                      Last activity: {new Date(org.lastActivity).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 glass-card">
                    <p className="text-2xl font-bold text-black">{org.totalTasks}</p>
                    <p className="text-xs text-gray-600">Total Tasks</p>
                  </div>
                  <div className="text-center p-3 glass-card">
                    <p className="text-2xl font-bold text-gray-700">{org.pendingTasks}</p>
                    <p className="text-xs text-gray-600">Pending</p>
                  </div>
                  <div className="text-center p-3 glass-card">
                    <p className="text-2xl font-bold text-black">{org.completedTasks}</p>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">
                    {((org.completedTasks / org.totalTasks) * 100).toFixed(0)}% Complete
                  </span>
                  <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-black h-2 rounded-full transition-all"
                      style={{ width: `${(org.completedTasks / org.totalTasks) * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
