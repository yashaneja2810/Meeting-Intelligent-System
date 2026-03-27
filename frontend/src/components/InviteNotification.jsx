import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
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
      // Only show pending invites
      setInvites(data.filter(i => i.status === 'pending'))
    } catch (err) {
      console.error('Load invites error:', err)
    }
  }

  if (dismissed || invites.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed top-6 right-6 z-[100] max-w-sm w-full"
      >
        <div className="surface p-5 shadow-2xl shadow-black/10 ring-1 ring-black/5 border-transparent flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center text-lg shadow-sm">
                📬
              </div>
              <div>
                <h3 className="font-bold text-black tracking-tight text-sm">Team Invitation{invites.length > 1 ? 's' : ''}</h3>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">
                  Action Required
                </p>
              </div>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-black focus:outline-none transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <p className="text-sm text-gray-600 font-medium">
            You have <span className="font-bold text-black">{invites.length} pending</span> team invitation{invites.length > 1 ? 's' : ''}. Proceed to your dashboard to respond.
          </p>

          <div className="pt-2">
            <button
              onClick={() => {
                setDismissed(true)
                navigate('/employee/invites')
              }}
              className="w-full btn-primary text-sm py-2.5 shadow-md flex items-center justify-center gap-2"
            >
              View Invitations
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
