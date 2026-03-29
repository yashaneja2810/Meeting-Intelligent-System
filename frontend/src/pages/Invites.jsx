import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import DashboardLayout from '@/components/DashboardLayout'
import ConfirmDialog from '@/components/ConfirmDialog'
import AlertDialog from '@/components/AlertDialog'
import { motion, AnimatePresence } from 'framer-motion'

export default function Invites() {
  const [sentInvites, setSentInvites] = useState([])
  const [receivedInvites, setReceivedInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('received')
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [alertDialog, setAlertDialog] = useState(null)

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
      await loadInvites()
      setAlertDialog({
        title: 'Invite Accepted',
        message: 'Invite accepted! You can now receive task assignments.',
        variant: 'success'
      })
    } catch (err) {
      setAlertDialog({
        title: 'Accept Failed',
        message: err.message,
        variant: 'error'
      })
      setLoading(false)
    }
  }

  const handleReject = async (inviteId) => {
    setConfirmDialog({
      title: 'Decline Invitation',
      message: 'Are you sure you want to decline this invitation?',
      onConfirm: async () => {
        setLoading(true)
        try {
          await api.post(`/invites/${inviteId}/reject`)
          await loadInvites()
        } catch (err) {
          setAlertDialog({
            title: 'Reject Failed',
            message: err.message,
            variant: 'error'
          })
          setLoading(false)
        }
      }
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted': return 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
      case 'rejected': return 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20'
      case 'pending': return 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20'
      default: return 'bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-400/20'
    }
  }

  if (loading && sentInvites.length === 0 && receivedInvites.length === 0) {
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
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-3">Team Invitations</h1>
          <p className="text-gray-500 text-lg font-medium tracking-tight">Review organizations you've been invited to or have invited others to.</p>
        </div>

        {/* Premium Native Segmented Control */}
        <div className="flex justify-center md:justify-start mb-12">
          <div className="bg-[#F8F9FA] p-1.5 rounded-2xl inline-flex shadow-inner border border-gray-200/60 ring-1 ring-black/[0.02]">
            <button
              onClick={() => setActiveTab('received')}
              className={`px-8 py-3 rounded-xl text-[14px] font-bold transition-all duration-300 flex items-center gap-3 ${activeTab === 'received'
                ? 'bg-white text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.06)] ring-1 ring-gray-200/50'
                : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              Received <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black tracking-widest ${activeTab === 'received' ? 'bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-500/20' : 'bg-gray-200/80 text-gray-500'}`}>{receivedInvites.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`px-8 py-3 rounded-xl text-[14px] font-bold transition-all duration-300 flex items-center gap-3 ${activeTab === 'sent'
                ? 'bg-white text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.06)] ring-1 ring-gray-200/50'
                : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              Sent <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black tracking-widest ${activeTab === 'sent' ? 'bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-500/20' : 'bg-gray-200/80 text-gray-500'}`}>{sentInvites.filter(i => i.status === 'pending').length}</span>
            </button>
          </div>
        </div>

        {/* Received Invites */}
        {activeTab === 'received' && (
          <AnimatePresence mode="wait">
            {receivedInvites.length === 0 ? (
              <motion.div
                key="empty-received"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#FAFAFA] rounded-[2rem] flex flex-col items-center justify-center p-24 text-center border border-gray-100/50 shadow-[inset_0_2px_8px_rgba(0,0,0,0.02)]"
              >
                <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-8 shadow-sm border border-gray-100">
                  <span className="text-4xl filter grayscale opacity-50">📬</span>
                </div>
                <p className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">No pending invitations</p>
                <p className="text-gray-500 font-medium">You're all caught up. Any invites sent to you will appear here.</p>
              </motion.div>
            ) : (
              <motion.div key="list-received" className="grid gap-8">
                {receivedInvites.map((invite, index) => (
                  <motion.div
                    key={invite.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-white rounded-[1.5rem] p-8 md:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.02)] ring-1 ring-gray-200/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:ring-indigo-100 transition-all duration-400 relative overflow-hidden group"
                  >
                    {/* Hover wash */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
                      <div className="flex items-center gap-5 border-l-4 border-indigo-500 pl-6 bg-[#FAFAFA] py-4 pr-8 rounded-r-2xl border-y border-r border-gray-100/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
                        <div className="w-14 h-14 bg-gray-900 text-white rounded-[1.2rem] flex items-center justify-center text-2xl font-black shadow-[0_4px_14px_0_rgb(0,0,0,0.15)] ring-1 ring-inset ring-white/10 shrink-0">
                          {invite.company_name ? invite.company_name[0].toUpperCase() : 'C'}
                        </div>
                        <div>
                          <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1">
                            {invite.company_name || 'Organization'}
                          </h3>
                          <p className="text-gray-500 font-medium text-[15px]">
                            Invited you as <span className="text-gray-900 font-bold">{invite.role}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${getStatusBadge(invite.status)}`}>
                          {invite.status}
                        </span>
                        <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          {new Date(invite.invited_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {invite.skills && invite.skills.length > 0 && (
                      <div className="bg-white rounded-[1.5rem] p-6 mb-8 border border-gray-200/80 shadow-sm relative z-10">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          Expected Inference Skills
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                          {invite.skills.map((skill, i) => (
                            <span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-lg text-[13px] shadow-sm tracking-tight hover:bg-white hover:border-gray-300 transition-colors">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {invite.status === 'pending' && (
                      <div className="flex gap-4 pt-6 border-t border-gray-100/80 mt-auto relative z-10">
                        <button
                          onClick={() => handleAccept(invite.id)}
                          className="flex-1 bg-gray-900 text-white font-bold py-4 rounded-xl shadow-[0_4px_14px_0_rgb(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:bg-gray-800 transition-all hover:-translate-y-0.5 text-[15px] flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          Accept Invitation
                        </button>
                        <button
                          onClick={() => handleReject(invite.id)}
                          className="flex-1 bg-white border border-rose-200 hover:border-rose-300 text-rose-600 hover:bg-rose-50 font-bold py-4 rounded-xl shadow-sm transition-all text-[15px]"
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
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#FAFAFA] rounded-[2rem] flex flex-col items-center justify-center p-24 text-center border border-gray-100/50 shadow-[inset_0_2px_8px_rgba(0,0,0,0.02)]"
              >
                <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-8 shadow-sm border border-gray-100">
                  <span className="text-4xl filter grayscale opacity-50">📤</span>
                </div>
                <p className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">No invitations sent</p>
                <p className="text-gray-500 font-medium mb-8">Build your organization structure by sending out invites.</p>
                <button onClick={() => { window.location.href = '/admin/team' }} className="bg-gray-900 text-white font-bold px-8 py-4 rounded-xl shadow-[0_4px_14px_0_rgb(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-0.5">
                  Manage Team
                </button>
              </motion.div>
            ) : (
              <motion.div key="list-sent" className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sentInvites.map((invite, index) => (
                  <motion.div
                    key={invite.id}
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-white p-8 rounded-[1.5rem] shadow-[0_2px_12px_rgba(0,0,0,0.02)] ring-1 ring-gray-200/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:ring-indigo-100 transition-all duration-400 relative group flex flex-col overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                    <div className="relative z-10 flex justify-between items-start mb-6">
                      <div className="w-14 h-14 rounded-[1.2rem] bg-gray-50 flex items-center justify-center text-xl font-black text-gray-400 border border-gray-200 shadow-sm shrink-0">
                        @
                      </div>
                      <span className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${getStatusBadge(invite.status)}`}>
                        {invite.status}
                      </span>
                    </div>

                    <div className="mb-8 flex-1 relative z-10">
                      <h3 className="font-extrabold text-[17px] text-gray-900 tracking-tight truncate mb-2 group-hover:text-indigo-600 transition-colors" title={invite.invitee_email}>{invite.invitee_email}</h3>
                      <p className="text-gray-500 font-medium text-[14px]">Role: <span className="text-gray-900 font-bold">{invite.role}</span></p>
                    </div>

                    <div className="pt-5 border-t border-gray-100/80 flex flex-col gap-2.5 relative z-10">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        Sent {new Date(invite.invited_at).toLocaleDateString()}
                      </p>
                      {invite.responded_at && (
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
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

        <ConfirmDialog
          isOpen={!!confirmDialog}
          onClose={() => setConfirmDialog(null)}
          onConfirm={confirmDialog?.onConfirm || (() => {})}
          title={confirmDialog?.title}
          message={confirmDialog?.message}
          variant="danger"
          confirmText="Decline"
        />

        <AlertDialog
          isOpen={!!alertDialog}
          onClose={() => setAlertDialog(null)}
          title={alertDialog?.title}
          message={alertDialog?.message}
          variant={alertDialog?.variant}
        />
      </div>
    </DashboardLayout>
  )
}
