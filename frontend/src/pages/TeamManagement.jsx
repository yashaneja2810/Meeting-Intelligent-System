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
  const [formData, setFormData] = useState({ name: '', email: '', role: '', skills: '', slack_webhook: '', slack_id: '' })

  useEffect(() => { loadTeam() }, [])

  const loadTeam = async () => {
    try {
      const data = await api.get('/team')
      setTeamMembers(Array.isArray(data) ? data : [])
    } catch (err) {
      setTeamMembers([])
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
      if (editingMember) await api.put(`/team/${editingMember.id}`, payload)
      else await api.post('/team', payload)
      setShowModal(false)
      setEditingMember(null)
      loadTeam()
    } catch (err) {
      setAlertDialog({ title: 'Save Failed', message: err.message, variant: 'error' })
    }
  }

  const handleEdit = (member) => {
    setEditingMember(member)
    setFormData({
      name: member.name || '', email: member.email || '', role: member.role || '',
      skills: member.skills?.join(', ') || '', slack_webhook: member.slack_webhook || '', slack_id: member.slack_id || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    setConfirmDialog({
      title: 'Remove Team Member',
      message: 'Are you sure you want to remove this team member?',
      onConfirm: async () => {
        try { await api.delete(`/team/${id}`); loadTeam() }
        catch (err) { setAlertDialog({ title: 'Delete Failed', message: err.message, variant: 'error' }) }
      }
    })
  }

  const handleSendInvite = async (memberId) => {
    try {
      await api.post('/invites/send', { team_member_id: memberId })
      setAlertDialog({ title: 'Invitation Sent', message: 'Invitation sent successfully!', variant: 'success' })
      loadTeam()
    } catch (err) {
      setAlertDialog({ title: 'Send Failed', message: err.message, variant: 'error' })
    }
  }

  const handleToggleActive = async (member) => {
    try {
      await api.put(`/team/${member.id}`, { ...member, is_active: !member.is_active })
      loadTeam()
    } catch (err) {
      setAlertDialog({ title: 'Update Failed', message: err.message, variant: 'error' })
    }
  }

  const getInviteBadge = (status) => {
    const map = {
      joined: { label: 'Joined', c: 'var(--success)' },
      pending: { label: 'Pending', c: 'var(--warning)' },
      not_invited: { label: 'Not Invited', c: 'var(--text-tertiary)' }
    }
    return map[status] || map.not_invited
  }

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div style={{ padding: '32px 36px', maxWidth: 1200, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 className="page-title">Team Management</h1>
            <p className="page-subtitle">Add members, manage roles, and review AI workload assignments.</p>
          </div>
          <button
            onClick={() => {
              setEditingMember(null)
              setFormData({ name: '', email: '', role: '', skills: '', slack_webhook: '', slack_id: '' })
              setShowModal(true)
            }}
            className="btn-primary"
            style={{ fontSize: 14 }}
          >
            + Add Member
          </button>
        </div>

        {teamMembers.length === 0 ? (
          <div className="card empty-state" style={{ padding: 60 }}>
            <div className="empty-icon" style={{ marginBottom: 16 }}>
              <svg style={{width:24,height:24}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Build your team</p>
            <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 20 }}>Add members to start assigning tasks from your meetings.</p>
            <button onClick={() => setShowModal(true)} className="btn-primary" style={{ padding: '12px 20px' }}>Add Your First Member</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            <AnimatePresence>
              {teamMembers.map((member, index) => {
                const b = getInviteBadge(member.invite_status)
                return (
                  <motion.div
                    key={member.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                    className="card" style={{ display: 'flex', flexDirection: 'column', opacity: member.is_active ? 1 : 0.6 }}
                  >
                    <div style={{ padding: 24, flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="avatar" style={{ width: 44, height: 44, fontSize: 18 }}>{member.name[0].toUpperCase()}</div>
                          <div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{member.name}</h3>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{member.role}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                          <span className="badge badge-default" style={{ color: b.c, borderColor: b.c + '30', background: b.c + '12' }}>{b.label}</span>
                          {!member.is_active && <span className="badge badge-default" style={{ color: 'var(--danger)', borderColor: 'var(--danger)30', background: 'var(--danger)12' }}>Inactive</span>}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-tertiary)' }}>
                          <span>✉</span> {member.email}
                        </div>
                        {member.slack_webhook && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-primary)' }}>
                            <span style={{ color: 'var(--info)' }}>#</span> Slack Integrated
                          </div>
                        )}
                      </div>

                      <div style={{ marginBottom: 24 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>AI Inference Skills</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {member.skills?.length > 0 ? (
                            member.skills.map((skill, i) => <span key={i} className="chip">{skill}</span>)
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No skills listed</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Workload</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{member.workload_score || 0} pts</span>
                        </div>
                        <div className="progress-track" style={{ height: 6 }}>
                          <div className="progress-bar" style={{ width: `${Math.min(((member.workload_score || 0) / 20) * 100, 100)}%`, background: 'var(--info)' }} />
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottomLeftRadius: 18, borderBottomRightRadius: 18 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleEdit(member)} className="btn-ghost" style={{ padding: 6, borderRadius: '50%' }}>
                          <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        {(member.invite_status === 'not_invited' || member.invite_status === 'pending') && (
                          <button onClick={() => handleSendInvite(member.id)} className="btn-ghost" style={{ padding: 6, borderRadius: '50%', color: 'var(--info)' }}>
                            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button onClick={() => handleToggleActive(member)} style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                          {member.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDelete(member.id)} style={{ fontSize: 12, fontWeight: 700, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence>
          {showModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card custom-scrollbar" style={{ padding: 32, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{editingMember ? 'Edit Team Member' : 'Add Team Member'}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Details used by AI for context-aware task assignments.</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label className="label">Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                      <input type="text" className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" required />
                    </div>
                    <div>
                      <label className="label">Email <span style={{ color: 'var(--danger)' }}>*</span></label>
                      <input type="email" className="input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" required />
                    </div>
                  </div>

                  <div>
                    <label className="label">Role <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="text" className="input" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} placeholder="e.g., Lead Backend Developer" required />
                  </div>

                  <div>
                    <label className="label">Top Skills</label>
                    <input type="text" className="input" value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} placeholder="React, Node.js, Python" />
                    <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>Comma separated</p>
                  </div>

                  <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: 20, border: '1px solid var(--border-default)', marginTop: 8 }}>
                    <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Integrations</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <label className="label">Slack Webhook URL</label>
                        <input type="url" className="input" value={formData.slack_webhook} onChange={e => setFormData({ ...formData, slack_webhook: e.target.value })} placeholder="https://hooks.slack.com/..." />
                      </div>
                      <div>
                        <label className="label">Slack Connect ID</label>
                        <input type="text" className="input" value={formData.slack_id} onChange={e => setFormData({ ...formData, slack_id: e.target.value })} placeholder="@username" />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: 12 }}>Cancel</button>
                    <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: 12 }}>{editingMember ? 'Save Changes' : '+ Add Member'}</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <ConfirmDialog isOpen={!!confirmDialog} onClose={() => setConfirmDialog(null)} onConfirm={confirmDialog?.onConfirm || (() => {})} title={confirmDialog?.title} message={confirmDialog?.message} variant="danger" confirmText="Remove" />
        <AlertDialog isOpen={!!alertDialog} onClose={() => setAlertDialog(null)} title={alertDialog?.title} message={alertDialog?.message} variant={alertDialog?.variant} />
      </div>
    </DashboardLayout>
  )
}
