import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import DashboardLayout from '../components/DashboardLayout'
import { motion } from 'framer-motion'

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
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : []
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
      name: member.name,
      email: member.email,
      role: member.role,
      skills: member.skills?.join(', ') || '',
      slack_webhook: member.slack_webhook || '',
      slack_id: member.slack_id || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this team member?')) return

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
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Team Management</h1>
            <p className="text-gray-600 mt-1">Manage your team members and their roles</p>
          </div>
          <button
            onClick={() => {
              setEditingMember(null)
              setFormData({
                name: '',
                email: '',
                role: '',
                skills: '',
                slack_webhook: '',
                slack_id: ''
              })
              setShowModal(true)
            }}
            className="btn-primary"
          >
            + Add Member
          </button>
        </div>

        {teamMembers.length === 0 ? (
          <div className="liquid-glass text-center py-12">
            <p className="text-4xl mb-4">👥</p>
            <p className="text-gray-600 mb-4">No team members yet</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Add Your First Member
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`liquid-glass p-6 ${!member.is_active ? 'opacity-60' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-semibold text-lg">
                      {member.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    member.invite_status === 'joined' ? 'bg-black text-white' :
                    member.invite_status === 'pending' ? 'bg-gray-400 text-white' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {member.invite_status === 'joined' ? 'Joined' :
                     member.invite_status === 'pending' ? 'Invite Pending' :
                     'Not Invited'}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium">{member.email}</p>
                  </div>
                  {member.skills && member.skills.length > 0 && (
                    <div>
                      <span className="text-gray-500">Skills:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {member.skills.map((skill, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Workload Score:</span>
                    <p className="font-medium">{member.workload_score}</p>
                  </div>
                  {member.slack_webhook && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <span>✓</span>
                      <span>Slack connected</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(member)}
                    className="text-sm text-black hover:underline font-medium"
                  >
                    Edit
                  </button>
                  {member.invite_status !== 'joined' && member.invite_status !== 'pending' && (
                    <button
                      onClick={() => handleSendInvite(member.id)}
                      className="text-sm btn-success px-3 py-1"
                    >
                      Send Invite
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleActive(member)}
                    className="text-sm text-gray-600 hover:underline"
                  >
                    {member.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="text-sm btn-danger px-3 py-1"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="liquid-glass p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-semibold mb-4">
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g., Backend Developer, Designer"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="e.g., React, Node.js, Python"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slack Webhook URL
                  </label>
                  <input
                    type="text"
                    value={formData.slack_webhook}
                    onChange={(e) => setFormData({ ...formData, slack_webhook: e.target.value })}
                    placeholder="https://hooks.slack.com/..."
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slack ID
                  </label>
                  <input
                    type="text"
                    value={formData.slack_id}
                    onChange={(e) => setFormData({ ...formData, slack_id: e.target.value })}
                    placeholder="@username"
                    className="input-field"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    {editingMember ? 'Update' : 'Add'} Member
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
