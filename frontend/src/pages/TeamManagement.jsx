import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import DashboardLayout from '@/components/DashboardLayout'
import ConfirmDialog from '@/components/ConfirmDialog'
import AlertDialog from '@/components/AlertDialog'
import { motion, AnimatePresence } from 'framer-motion'

export default function TeamManagement() {
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [alertDialog, setAlertDialog] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    skills: '',
    slack_webhook: '',
    slack_id: ''
  })

  useEffect(() => {
    loadTeam()
  }, [])

  const loadTeam = async () => {
    try {
      const data = await api.get('/team')
      setTeamMembers(data)
    } catch (err) {
      console.error('Load team error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : []
      }

      if (editingMember) {
        await api.put(`/team/${editingMember.id}`, payload)
      } else {
        await api.post('/team', payload)
      }

      setShowModal(false)
      setEditingMember(null)
      setFormData({
        name: '',
        email: '',
        role: '',
        skills: '',
        slack_webhook: '',
        slack_id: ''
      })
      loadTeam()
    } catch (err) {
      setAlertDialog({
        title: 'Save Failed',
        message: err.message,
        variant: 'error'
      })
    }
  }

  const handleEdit = (member) => {
    setEditingMember(member)
    setFormData({
      name: member.name || '',
      email: member.email || '',
      role: member.role || '',
      skills: member.skills?.join(', ') || '',
      slack_webhook: member.slack_webhook || '',
      slack_id: member.slack_id || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    setConfirmDialog({
      title: 'Remove Team Member',
      message: 'Are you sure you want to remove this team member? This cannot be undone.',
      onConfirm: async () => {
        try {
          await api.delete(`/team/${id}`)
          loadTeam()
        } catch (err) {
          setAlertDialog({
            title: 'Delete Failed',
            message: err.message,
            variant: 'error'
          })
        }
      }
    })
  }

  const handleSendInvite = async (memberId) => {
    try {
      await api.post('/invites/send', { team_member_id: memberId })
      setAlertDialog({
        title: 'Invitation Sent',
        message: 'Invitation sent successfully!',
        variant: 'success'
      })
      loadTeam()
    } catch (err) {
      setAlertDialog({
        title: 'Send Failed',
        message: err.message,
        variant: 'error'
      })
    }
  }

  const handleToggleActive = async (member) => {
    try {
      await api.put(`/team/${member.id}`, {
        ...member,
        is_active: !member.is_active
      })
      loadTeam()
    } catch (err) {
      setAlertDialog({
        title: 'Update Failed',
        message: err.message,
        variant: 'error'
      })
    }
  }

  const getInviteBadge = (status) => {
    switch (status) {
      case 'joined': return 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
      case 'pending': return 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20'
      case 'not_invited': return 'bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-400/20'
      default: return 'bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-400/20'
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-3">Team Management</h1>
            <p className="text-gray-500 text-lg font-medium tracking-tight">Add members, manage roles, and review AI workload assignments.</p>
          </div>
          <button
            onClick={() => {
              setEditingMember(null)
              setFormData({ name: '', email: '', role: '', skills: '', slack_webhook: '', slack_id: '' })
              setShowModal(true)
            }}
            className="bg-gray-900 text-white font-bold px-6 py-3.5 rounded-2xl flex items-center gap-2.5 hover:bg-gray-800 transition-all shadow-[0_4px_14px_0_rgb(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Member
          </button>
        </div>

        {teamMembers.length === 0 ? (
          <div className="bg-[#FAFAFA] rounded-[2rem] flex flex-col items-center justify-center p-24 text-center border border-gray-100/50">
            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-8 shadow-sm border border-gray-100">
              <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">Build your team</p>
            <p className="text-gray-500 font-medium mb-8">Add members to start assigning tasks from your meetings.</p>
            <button onClick={() => setShowModal(true)} className="bg-gray-900 text-white font-bold px-8 py-4 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
              Add Your First Member
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className={`bg-white rounded-[1.5rem] p-8 flex flex-col shadow-[0_2px_12px_rgba(0,0,0,0.02)] ring-1 ring-gray-200/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:ring-indigo-100 transition-all duration-400 relative overflow-hidden group ${!member.is_active ? 'opacity-50 saturate-50 hover:opacity-100 hover:saturate-100' : ''}`}
              >
                {/* Subtle hover gradient wash */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                <div className="relative z-10 flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[1rem] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white font-bold text-xl shadow-sm ring-1 ring-inset ring-black/20 group-hover:scale-105 transition-transform">
                      {member.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[18px] text-gray-900 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">{member.name}</h3>
                      <p className="text-[13px] font-semibold text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 items-end">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase ${getInviteBadge(member.invite_status)}`}>
                      {member.invite_status === 'joined' ? 'Joined' : member.invite_status === 'pending' ? 'Pending' : 'Not Invited'}
                    </span>
                    {!member.is_active && (
                      <span className="px-2.5 py-1 rounded-md text-[10px] bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-500/20 font-bold uppercase tracking-widest">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative z-10 space-y-5 mb-6 flex-1">
                  <div className="bg-[#FAFAFA] rounded-2xl p-5 border border-gray-100/80 flex flex-col gap-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[14px] font-semibold text-gray-700 truncate">{member.email}</span>
                    </div>
                    {member.slack_webhook && (
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <span className="text-[14px] font-semibold text-gray-900">Slack Integrated</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">AI Inference Skills</span>
                    <div className="flex flex-wrap gap-2">
                      {member.skills && member.skills.length > 0 ? (
                        member.skills.map((skill, i) => (
                          <span key={i} className="px-3 py-1 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg text-[11px] shadow-sm">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-[13px] text-gray-400 font-medium italic">No specific skills listed</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Workload Score</span>
                      <span className="text-[12px] font-black text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">{member.workload_score || 0} pts</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner flex">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(((member.workload_score || 0) / 20) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex gap-3 pt-5 border-t border-gray-100/80 justify-between items-center mt-auto">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(member)}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-sm"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    {(member.invite_status === 'not_invited' || member.invite_status === 'pending') && (
                      <button
                        onClick={() => handleSendInvite(member.id)}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 border border-gray-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors shadow-sm"
                        title="Send Invite"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleActive(member)}
                      className="text-[12px] font-bold text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      {member.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="text-[12px] font-bold text-rose-500 hover:text-rose-700 hover:underline transition-colors block"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white p-8 md:p-10 max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl ring-1 ring-black/5 custom-scrollbar"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 bg-gray-50 rounded-[1.2rem] flex items-center justify-center border border-gray-100 shrink-0">
                    <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {editingMember ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      )}
                    </svg>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <h3 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
                  {editingMember ? 'Edit Team Member' : 'Add Team Member'}
                </h3>
                <p className="text-[14px] font-medium text-gray-500 mb-8">Details used by AI for context-aware task assignments.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Name <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-[#FAFAFA] border border-gray-200/80 rounded-2xl text-[14px] font-semibold text-gray-900 px-4 py-3.5 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-gray-300 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email <span className="text-rose-500">*</span></label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-[#FAFAFA] border border-gray-200/80 rounded-2xl text-[14px] font-semibold text-gray-900 px-4 py-3.5 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-gray-300 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Role <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g., Lead Backend Developer"
                      className="w-full bg-[#FAFAFA] border border-gray-200/80 rounded-2xl text-[14px] font-semibold text-gray-900 px-4 py-3.5 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-gray-300 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Top Skills & Inference Mapping</label>
                    <input
                      type="text"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      placeholder="React, Node.js, Python, System Architecture"
                      className="w-full bg-[#FAFAFA] border border-gray-200/80 rounded-2xl text-[14px] font-semibold text-gray-900 px-4 py-3.5 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-gray-300 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
                    />
                    <p className="text-[11px] text-gray-400 font-bold ml-1 mt-2 tracking-tight">Comma separated exact skill matches</p>
                  </div>

                  <div className="p-6 bg-[#FAFAFA] rounded-[1.5rem] border border-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] space-y-5">
                    <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      Integrations
                    </h4>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Slack Webhook URL</label>
                      <input
                        type="url"
                        value={formData.slack_webhook}
                        onChange={(e) => setFormData({ ...formData, slack_webhook: e.target.value })}
                        placeholder="https://hooks.slack.com/..."
                        className="w-full bg-white border border-gray-200/80 rounded-2xl text-[13px] font-semibold text-gray-900 px-4 py-3 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-gray-300 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Slack Connect ID</label>
                      <input
                        type="text"
                        value={formData.slack_id}
                        onChange={(e) => setFormData({ ...formData, slack_id: e.target.value })}
                        placeholder="@username"
                        className="w-full bg-white border border-gray-200/80 rounded-2xl text-[13px] font-semibold text-gray-900 px-4 py-3 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-gray-300 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 mt-8 border-t border-gray-100">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 font-bold px-6 py-4 rounded-xl hover:bg-gray-100 transition-colors shadow-sm text-[15px]">
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 bg-gray-900 text-white font-bold px-6 py-4 rounded-xl shadow-sm hover:bg-gray-800 transition-all hover:shadow-[0_4px_14px_0_rgb(0,0,0,0.15)] hover:-translate-y-0.5 text-[15px] flex justify-center items-center gap-2">
                      {editingMember ? 'Save Changes' : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          Add Member
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <ConfirmDialog
          isOpen={!!confirmDialog}
          onClose={() => setConfirmDialog(null)}
          onConfirm={confirmDialog?.onConfirm || (() => {})}
          title={confirmDialog?.title}
          message={confirmDialog?.message}
          variant="danger"
          confirmText="Remove"
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
