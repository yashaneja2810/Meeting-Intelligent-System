import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { motion, AnimatePresence } from 'framer-motion'

export default function InviteNotification() {
  const navigate = useNavigate()
  const [invites, setInvites] = useState([])
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    loadInvites()
  }, [])

  const loadInvites = async () => {
    try {
      const data = await api.get('/invites/received')
      setInvites(data)
    } catch (err) {
      console.error('Load invites error:', err)
    }
  }

  if (dismissed || invites.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 right-4 z-50 max-w-md"
      >
        <div className="liquid-glass p-6 shadow-2xl border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📬</span>
              <h3 className="font-semibold text-black text-lg">Team Invitation{invites.length > 1 ? 's' : ''}</h3>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="text-gray-500 hover:text-black transition text-xl"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            You have {invites.length} pending team invitation{invites.length > 1 ? 's' : ''}
          </p>
          <button
            onClick={() => navigate('/employee/invites')}
            className="w-full bg-black text-white px-4 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition shadow-lg"
          >
            View Invitations
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
