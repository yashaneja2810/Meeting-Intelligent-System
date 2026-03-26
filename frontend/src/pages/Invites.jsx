import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import DashboardLayout from '../components/DashboardLayout'
import { motion } from 'framer-motion'

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
    try {
      await api.post(`/invites/${inviteId}/accept`)
      alert('Invite accepted! You can now receive task assignments.')
      loadInvites()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleReject = async (inviteId) => {
    if (!confirm('Are you sure you want to reject this invitation?')) return
    
    try {
      await api.post(`/invites/${inviteId}/reject`)
      loadInvites()
    } catch (err) {
      alert(err.message)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-black text-white'
      case 'rejected': return 'bg-gray-400 text-white'
      case 'pending': return 'bg-gray-200 text-gray-800'
      default: return 'bg-gray-100 text-gray-700'
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
        <h1 className="text-3xl font-bold mb-2">Team Invitations</h1>
        <p className="text-gray-600 mb-8">Manage your team invitations</p>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'received'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Received ({receivedInvites.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'sent'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sent ({sentInvites.filter(i => i.status === 'pending').length})
          </button>
        </div>

        {/* Received Invites */}
        {activeTab === 'received' && (
          <div>
            {receivedInvites.length === 0 ? (
              <div className="liquid-glass p-8 text-center py-12">
                <p className="text-4xl mb-4">📬</p>
                <p className="text-gray-600">No pending invitations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {receivedInvites.map((invite, index) => (
                  <motion.div
                    key={invite.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="liquid-glass p-6 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          Join {invite.company_name}
                        </h3>
                        <p className="text-gray-600">
                          You've been invited to join as a <span className="font-medium">{invite.role}</span>
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(invite.status)}`}>
                        {invite.status}
                      </span>
                    </div>

                    {invite.skills && invite.skills.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Expected Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {invite.skills.map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-sm text-gray-500 mb-4">
                      Invited {new Date(invite.invited_at).toLocaleDateString()}
                    </div>

                    {invite.status === 'pending' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAccept(invite.id)}
                          className="btn-success flex-1"
                        >
                          Accept Invitation
                        </button>
                        <button
                          onClick={() => handleReject(invite.id)}
                          className="btn-danger flex-1"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sent Invites */}
        {activeTab === 'sent' && (
          <div>
            {sentInvites.length === 0 ? (
              <div className="liquid-glass p-8 text-center py-12">
                <p className="text-4xl mb-4">📤</p>
                <p className="text-gray-600">No invitations sent yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Add team members and send them invitations from the Team Management page
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sentInvites.map((invite, index) => (
                  <motion.div
                    key={invite.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="liquid-glass p-6"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{invite.invitee_email}</h3>
                        <p className="text-gray-600 text-sm mb-2">Role: {invite.role}</p>
                        <p className="text-xs text-gray-500">
                          Sent {new Date(invite.invited_at).toLocaleDateString()}
                          {invite.responded_at && ` • Responded ${new Date(invite.responded_at).toLocaleDateString()}`}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(invite.status)}`}>
                        {invite.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
