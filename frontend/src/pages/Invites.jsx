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

  useEffect(() => { loadInvites() }, [])

  const loadInvites = async () => {
    try {
      const [sent, received] = await Promise.all([api.get('/invites/sent'), api.get('/invites/received')])
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
      setAlertDialog({ title: 'Invite Accepted', message: 'Invite accepted! You can now receive task assignments.', variant: 'success' })
    } catch (err) {
      setAlertDialog({ title: 'Accept Failed', message: err.message, variant: 'error' })
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
          setAlertDialog({ title: 'Reject Failed', message: err.message, variant: 'error' })
          setLoading(false)
        }
      }
    })
  }

  const getStatusBadge = (status) => {
    const map = {
      accepted: { label: 'Accepted', c: 'var(--success)' },
      rejected: { label: 'Declined', c: 'var(--danger)' },
      pending: { label: 'Pending', c: 'var(--warning)' }
    }
    return map[status] || { label: status, c: 'var(--text-tertiary)' }
  }

  if (loading && sentInvites.length === 0 && receivedInvites.length === 0) return (
    <DashboardLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div style={{ padding: '32px 36px', maxWidth: 1200, margin: '0 auto' }}>

        <div style={{ marginBottom: 40 }}>
          <h1 className="page-title">Team Invitations</h1>
          <p className="page-subtitle">Review organizations you've been invited to or have invited others to.</p>
        </div>

        <div style={{ display: 'flex', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', background: 'var(--bg-overlay)', padding: 4, borderRadius: 100, border: '1px solid var(--border-default)' }}>
            <button
              onClick={() => setActiveTab('received')}
              style={{
                padding: '8px 24px', borderRadius: 100, fontSize: 14, fontWeight: 700, transition: 'all 0.2s', border: 'none', cursor: 'pointer',
                background: activeTab === 'received' ? 'var(--bg-elevated)' : 'transparent',
                color: activeTab === 'received' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                boxShadow: activeTab === 'received' ? 'var(--shadow-sm)' : 'none',
                display: 'flex', alignItems: 'center', gap: 8
              }}
            >
              Received <span style={{ background: activeTab === 'received' ? 'var(--info)' : 'var(--bg-base)', color: activeTab === 'received' ? '#fff' : 'var(--text-secondary)', padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>{receivedInvites.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              style={{
                padding: '8px 24px', borderRadius: 100, fontSize: 14, fontWeight: 700, transition: 'all 0.2s', border: 'none', cursor: 'pointer',
                background: activeTab === 'sent' ? 'var(--bg-elevated)' : 'transparent',
                color: activeTab === 'sent' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                boxShadow: activeTab === 'sent' ? 'var(--shadow-sm)' : 'none',
                display: 'flex', alignItems: 'center', gap: 8
              }}
            >
              Sent <span style={{ background: activeTab === 'sent' ? 'var(--info)' : 'var(--bg-base)', color: activeTab === 'sent' ? '#fff' : 'var(--text-secondary)', padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>{sentInvites.filter(i => i.status === 'pending').length}</span>
            </button>
          </div>
        </div>

        {activeTab === 'received' && (
          <AnimatePresence mode="wait">
            {receivedInvites.length === 0 ? (
              <motion.div key="empty-received" initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="card empty-state" style={{ padding: 60 }}>
                <div className="empty-icon" style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 32 }}>📬</span>
                </div>
                <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No pending invitations</p>
                <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>You're all caught up. Any invites sent to you will appear here.</p>
              </motion.div>
            ) : (
              <motion.div key="list-received" className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 24 }}>
                {receivedInvites.map((invite, index) => {
                  const b = getStatusBadge(invite.status)
                  return (
                    <motion.div key={invite.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ padding: 24, flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div className="avatar" style={{ width: 48, height: 48, fontSize: 20 }}>{invite.company_name ? invite.company_name[0].toUpperCase() : 'C'}</div>
                            <div>
                              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{invite.company_name || 'Organization'}</h3>
                              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Invited as <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{invite.role}</span></p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                            <span className="badge badge-default" style={{ color: b.c, borderColor: b.c + '30', background: b.c + '12' }}>{b.label}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700 }}>{new Date(invite.invited_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {invite.skills?.length > 0 && (
                          <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: 16, border: '1px solid var(--border-default)' }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ color: 'var(--info)' }}>#</span> Expected Inference Skills
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                              {invite.skills.map((skill, i) => <span key={i} className="chip">{skill}</span>)}
                            </div>
                          </div>
                        )}
                      </div>

                      {invite.status === 'pending' && (
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-overlay)', display: 'flex', gap: 12, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 }}>
                          <button onClick={() => handleAccept(invite.id)} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>✓ Accept Invitation</button>
                          <button onClick={() => handleReject(invite.id)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', color: 'var(--danger)', borderColor: 'var(--danger)30' }}>Decline</button>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {activeTab === 'sent' && (
          <AnimatePresence mode="wait">
            {sentInvites.length === 0 ? (
              <motion.div key="empty-sent" initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="card empty-state" style={{ padding: 60 }}>
                <div className="empty-icon" style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 32 }}>📤</span>
                </div>
                <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No invitations sent</p>
                <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 24 }}>Build your organization structure by sending out invites.</p>
                <button onClick={() => { window.location.href = '/admin/team' }} className="btn-primary" style={{ padding: '12px 24px' }}>Manage Team</button>
              </motion.div>
            ) : (
              <motion.div key="list-sent" className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
                {sentInvites.map((invite, index) => {
                  const b = getStatusBadge(invite.status)
                  return (
                    <motion.div key={invite.id} initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="card" style={{ padding: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <div className="avatar" style={{ width: 44, height: 44, fontSize: 18, background: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}>@</div>
                        <span className="badge badge-default" style={{ color: b.c, borderColor: b.c + '30', background: b.c + '12' }}>{b.label}</span>
                      </div>
                      
                      <div style={{ marginBottom: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={invite.invitee_email}>{invite.invitee_email}</h3>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Role: <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{invite.role}</span></p>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: 'var(--info)' }}>↗</span> Sent {new Date(invite.invited_at).toLocaleDateString()}
                        </p>
                        {invite.responded_at && (
                          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: 'var(--success)' }}>✓</span> Responded {new Date(invite.responded_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        <ConfirmDialog isOpen={!!confirmDialog} onClose={() => setConfirmDialog(null)} onConfirm={confirmDialog?.onConfirm || (() => {})} title={confirmDialog?.title} message={confirmDialog?.message} variant="danger" confirmText="Decline" />
        <AlertDialog isOpen={!!alertDialog} onClose={() => setAlertDialog(null)} title={alertDialog?.title} message={alertDialog?.message} variant={alertDialog?.variant} />
      </div>
    </DashboardLayout>
  )
}
