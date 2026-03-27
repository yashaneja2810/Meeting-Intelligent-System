import { useEffect, useState } from 'react'
import { api } from '@/lib'
import { DashboardLayout } from '@/components'
import { motion, AnimatePresence } from 'framer-motion'

export default function TeamManagement() {
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
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
      alert(err.message)
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
    if (!confirm('Are you sure you want to remove this team member? This cannot be undone.')) return

    try {
      await api.delete(`/team/${id}`)
      loadTeam()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleSendInvite = async (memberId) => {
    try {
      await api.post('/invites/send', { team_member_id: memberId })
      alert('Invitation sent successfully!')
      loadTeam()
    } catch (err) {
      alert(err.message)
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
      alert(err.message)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-[3px] border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-headline mb-2">Team Management</h1>
            <p className="text-gray-500 font-medium tracking-tight">Add members, manage roles, and review AI workload assignments.</p>
          </div>
          <button
            onClick={() => {
              setEditingMember(null)
              setFormData({ name: '', email: '', role: '', skills: '', slack_webhook: '', slack_id: '' })
              setShowModal(true)
            }}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Member
          </button>
        </div>

        {teamMembers.length === 0 ? (
          <div className="surface flex flex-col items-center justify-center p-20 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-[28px] flex items-center justify-center mb-6 border border-gray-100 shadow-sm">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-black tracking-tight mb-2">Build your team</p>
            <p className="text-gray-500 font-medium mb-8">Add members to start assigning tasks from your meetings.</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Add Your First Member
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`surface p-8 flex flex-col hover:shadow-apple-hover transition-all duration-300 ${!member.is_active ? 'opacity-60 saturate-50' : ''}`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[18px] bg-black flex items-center justify-center text-white font-bold text-xl shadow-md">
                      {member.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-black tracking-tight">{member.name}</h3>
                      <p className="text-sm font-medium text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${member.invite_status === 'joined' ? 'bg-black text-white border-black' :
                        member.invite_status === 'pending' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          'bg-gray-50 text-gray-500 border-gray-200'
                      }`}>
                      {member.invite_status === 'joined' ? 'Joined' :
                        member.invite_status === 'pending' ? 'Pending' :
                          'Not Invited'}
                    </span>
                    {!member.is_active && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] bg-red-50 text-red-600 border border-red-200 font-bold uppercase tracking-wider">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mb-6 flex-1">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700 truncate">{member.email}</span>
                    </div>
                    {member.slack_webhook && (
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-black shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <span className="text-sm font-medium text-black">Slack Integrated</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">AI Inference Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {member.skills && member.skills.length > 0 ? (
                        member.skills.map((skill, i) => (
                          <span key={i} className="px-2.5 py-1 bg-white border border-gray-200 font-medium text-black rounded text-[11px] hover:border-black transition-colors">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400 italic">No specific skills listed</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Workload Score</span>
                      <span className="text-xs font-bold text-black">{member.workload_score || 0} pts</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-black rounded-full" style={{ width: `${Math.min(((member.workload_score || 0) / 20) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 justify-between items-center">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(member)}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-black hover:text-white transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    {(member.invite_status === 'not_invited' || member.invite_status === 'pending') && (
                      <button
                        onClick={() => handleSendInvite(member.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-black hover:text-white transition-colors"
                        title="Send Invite"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleActive(member)}
                      className="text-xs font-semibold text-gray-500 hover:text-black transition-colors"
                    >
                      {member.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors"
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
            <div className="fixed inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="surface p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-black/5"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shrink-0">
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {editingMember ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      )}
                    </svg>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <h3 className="text-2xl font-bold tracking-tight text-black mb-1">
                  {editingMember ? 'Edit Team Member' : 'Add Team Member'}
                </h3>
                <p className="text-sm font-medium text-gray-500 mb-8">Details used by AI for smart task assignment.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-field py-2.5 text-sm"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-field py-2.5 text-sm"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Role *</label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g., Lead Backend Developer"
                      className="input-field py-2.5 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Skills (Used for AI matching)</label>
                    <input
                      type="text"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      placeholder="React, Node.js, Python, System Design"
                      className="input-field py-2.5 text-sm"
                    />
                    <p className="text-[11px] text-gray-400 font-medium ml-1 mt-1 font-mono">Comma separated values</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                    <h4 className="text-xs font-bold text-black uppercase tracking-wider mb-2">Integrations</h4>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Slack Webhook URL</label>
                      <input
                        type="url"
                        value={formData.slack_webhook}
                        onChange={(e) => setFormData({ ...formData, slack_webhook: e.target.value })}
                        placeholder="https://hooks.slack.com/..."
                        className="input-field py-2 text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Slack ID</label>
                      <input
                        type="text"
                        value={formData.slack_id}
                        onChange={(e) => setFormData({ ...formData, slack_id: e.target.value })}
                        placeholder="@username"
                        className="input-field py-2 text-sm bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100">
                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary flex-1 shadow-md">
                      {editingMember ? 'Save Changes' : 'Add Member'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
