import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { motion, AnimatePresence } from 'framer-motion'

export default function Invites() {
  const [sentInvites, setSentInvites] = useState([])
  const [receivedInvites, setReceivedInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('received')

  useEffect(() => {
    loadInvites()
  }, [])

  const loadInvites = async () => {
    try {
      const [sent, received] = await Promise.all([
        api.get('/invites/sent'),
        api.get('/invites/received')
      ])
      setSentInvites(sent)
      setReceivedInvites(received)
    } catch (err) {
      console.error('Load invites error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (inviteId) => {
    setLoading(true)
    try {
      await api.post(`/invites/${inviteId}/accept`)
      // Refresh to show newly accepted state
      await loadInvites()
      alert('Invite accepted! You can now receive task assignments.')
    } catch (err) {
      alert(err.message)
      setLoading(false)
    }
  }

  const handleReject = async (inviteId) => {
    if (!confirm('Are you sure you want to decline this invitation?')) return

    setLoading(true)
    try {
      await api.post(`/invites/${inviteId}/reject`)
      await loadInvites()
    } catch (err) {
      alert(err.message)
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-black text-white border-black'
      case 'rejected': return 'bg-red-50 text-red-600 border-red-200'
      case 'pending': return 'bg-gray-50 text-gray-600 border-gray-200'
      default: return 'bg-white text-gray-600 border-gray-200'
    }
  }

  if (loading && sentInvites.length === 0 && receivedInvites.length === 0) {
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
      <div className="max-w-[1000px] mx-auto">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-headline mb-3">Team Invitations</h1>
          <p className="text-gray-500 font-medium tracking-tight">Review organizations you've been invited to or have invited others to.</p>
        </div>

        {/* Apple-style Segmented Control */}
        <div className="flex justify-center md:justify-start mb-8">
          <div className="bg-gray-100/80 backdrop-blur-md p-1 rounded-2xl inline-flex shadow-inner">
            <button
              onClick={() => setActiveTab('received')}
              className={`px-8 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'received'
                  ? 'bg-white text-black shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-black'
                }`}
            >
              Received <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'received' ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>{receivedInvites.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`px-8 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'sent'
                  ? 'bg-white text-black shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-black'
                }`}
            >
              Sent <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'sent' ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>{sentInvites.filter(i => i.status === 'pending').length}</span>
            </button>
          </div>
        </div>

        {/* Received Invites */}
        {activeTab === 'received' && (
          <AnimatePresence mode="wait">
            {receivedInvites.length === 0 ? (
              <motion.div
                key="empty-received"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="surface flex flex-col items-center justify-center p-20 text-center border-transparent shadow-sm"
              >
                <div className="w-24 h-24 bg-gray-50 rounded-[28px] flex items-center justify-center mb-6 border border-gray-100">
                  <span className="text-4xl filter grayscale opacity-50">📬</span>
                </div>
                <p className="text-2xl font-bold text-black tracking-tight mb-2">No pending invitations</p>
                <p className="text-gray-500 font-medium">You're all caught up. Any invites sent to you will appear here.</p>
              </motion.div>
            ) : (
              <motion.div key="list-received" className="grid gap-6">
                {receivedInvites.map((invite, index) => (
                  <motion.div
                    key={invite.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="surface p-8 hover:shadow-apple-hover transition-all duration-300 border-transparent shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                      <div className="flex items-center gap-5 border-l-4 border-black pl-5 bg-gray-50/50 py-3 pr-6 rounded-r-2xl">
                        <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-md">
                          {invite.company_name ? invite.company_name[0].toUpperCase() : 'C'}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-black tracking-tight mb-1">
                            {invite.company_name || 'Organization'}
                          </h3>
                          <p className="text-gray-500 font-medium text-sm">
                            Invited you as <span className="text-black font-semibold">{invite.role}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm border ${getStatusColor(invite.status)}`}>
                          {invite.status}
                        </span>
                        <span className="text-xs font-semibold text-gray-400">
                          {new Date(invite.invited_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {invite.skills && invite.skills.length > 0 && (
                      <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Expected AI Inference Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {invite.skills.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-white border border-gray-200 shadow-sm text-black font-medium rounded-lg text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {invite.status === 'pending' && (
                      <div className="flex gap-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => handleAccept(invite.id)}
                          className="btn-primary flex-1 shadow-md hover:shadow-lg py-3 text-sm"
                        >
                          Accept Invitation
                        </button>
                        <button
                          onClick={() => handleReject(invite.id)}
                          className="btn-secondary flex-1 py-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-100 border-gray-200"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Sent Invites */}
        {activeTab === 'sent' && (
          <AnimatePresence mode="wait">
            {sentInvites.length === 0 ? (
              <motion.div
                key="empty-sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="surface flex flex-col items-center justify-center p-20 text-center border-transparent shadow-sm"
              >
                <div className="w-24 h-24 bg-gray-50 rounded-[28px] flex items-center justify-center mb-6 border border-gray-100">
                  <span className="text-4xl filter grayscale opacity-50">📤</span>
                </div>
                <p className="text-2xl font-bold text-black tracking-tight mb-2">No invitations sent</p>
                <p className="text-gray-500 font-medium mb-6">Build your team by sending out invites.</p>
                <button onClick={() => { window.location.href = '/dashboard/team' }} className="btn-primary px-8">
                  Manage Team
                </button>
              </motion.div>
            ) : (
              <motion.div key="list-sent" className="grid md:grid-cols-2 gap-6">
                {sentInvites.map((invite, index) => (
                  <motion.div
                    key={invite.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="surface p-6 hover:shadow-apple-hover transition-all duration-300 border-transparent shadow-sm flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-500">
                        @
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border ${getStatusColor(invite.status)}`}>
                        {invite.status}
                      </span>
                    </div>

                    <div className="mb-6 flex-1">
                      <h3 className="font-bold text-lg text-black tracking-tight truncate mb-1" title={invite.invitee_email}>{invite.invitee_email}</h3>
                      <p className="text-gray-500 font-medium text-sm">Role: <span className="text-black">{invite.role}</span></p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex flex-col gap-1">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        Sent {new Date(invite.invited_at).toLocaleDateString()}
                      </p>
                      {invite.responded_at && (
                        <p className="text-[11px] font-bold text-gray-400 flex items-center gap-2">
                          <span className="w-4 h-[1px] bg-gray-300 ml-2 border-l border-gray-300"></span>
                          Responded {new Date(invite.responded_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </DashboardLayout>
  )
}
