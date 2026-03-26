import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { motion, AnimatePresence } from 'framer-motion'

export default function Onboarding() {
  const navigate = useNavigate()
  const { setProfile } = useAuthStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [profileData, setProfileData] = useState({
    display_name: '',
    company_name: ''
  })

  const [teamMembers, setTeamMembers] = useState([
    { name: '', email: '', role: '', skills: '', slack_webhook: '' }
  ])

  const [preferences, setPreferences] = useState({
    reminder_intervals: [24, 48, 72],
    escalation_rules: {
      first_reminder: 24,
      second_reminder: 48,
      escalate_after: 72
    }
  })

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { name: '', email: '', role: '', skills: '', slack_webhook: '' }])
  }

  const updateTeamMember = (index, field, value) => {
    const updated = [...teamMembers]
    updated[index][field] = value
    setTeamMembers(updated)
  }

  const removeTeamMember = (index) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index))
  }

  const handleNext = async () => {
    if (step === 1) {
      setLoading(true)
      try {
        const updated = await api.put('/users/profile', profileData)
        setProfile(updated)
        setStep(2)
      } catch (err) {
        alert(err.message)
      } finally {
        setLoading(false)
      }
    } else if (step === 2) {
      setStep(3)
    } else if (step === 3) {
      await handleComplete()
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      for (const member of teamMembers) {
        if (member.name && member.email && member.role) {
          await api.post('/team', {
            ...member,
            skills: member.skills ? member.skills.split(',').map(s => s.trim()) : []
          })
        }
      }
      await api.put('/users/profile', { preferences })
      await api.post('/users/complete-onboarding')
      navigate('/dashboard')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-6 py-12 bg-white">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">Welcome to AutoExec AI</h1>
          <p className="text-gray-600">Let's set up your workspace</p>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-center mb-12">
          <div className="bg-white border border-gray-200 rounded-lg px-8 py-4 inline-flex items-center gap-3">
            {[
              { num: 1, label: 'Profile' },
              { num: 2, label: 'Team' },
              { num: 3, label: 'Settings' }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
                    s.num <= step ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {s.num < step ? '✓' : s.num}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${s.num <= step ? 'text-black' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
                {s.num < 3 && (
                  <div className={`w-16 h-1 mx-3 rounded transition-all ${
                    s.num < step ? 'bg-black' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="border border-gray-200 rounded-lg p-8 bg-white"
            >
              <h2 className="text-2xl font-bold text-black mb-6">Profile Information</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Your Name</label>
                  <input
                    type="text"
                    value={profileData.display_name}
                    onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                    className="input-field"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Company Name</label>
                  <input
                    type="text"
                    value={profileData.company_name}
                    onChange={(e) => setProfileData({ ...profileData, company_name: e.target.value })}
                    className="input-field"
                    placeholder="Acme Inc."
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="border border-gray-200 rounded-lg p-8 bg-white"
            >
              <h2 className="text-2xl font-bold text-black mb-6">Add Team Members</h2>
              <div className="space-y-4 mb-6">
                {teamMembers.map((member, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-5 space-y-3">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-black">Member {index + 1}</span>
                      {teamMembers.length > 1 && (
                        <button
                          onClick={() => removeTeamMember(index)}
                          className="text-gray-600 hover:text-black text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={member.name}
                      onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                      className="input-field"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={member.email}
                      onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                      className="input-field"
                    />
                    <input
                      type="text"
                      placeholder="Role (e.g., Backend Developer)"
                      value={member.role}
                      onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                      className="input-field"
                    />
                    <input
                      type="text"
                      placeholder="Skills (comma-separated)"
                      value={member.skills}
                      onChange={(e) => updateTeamMember(index, 'skills', e.target.value)}
                      className="input-field"
                    />
                    <input
                      type="text"
                      placeholder="Slack Webhook URL (optional)"
                      value={member.slack_webhook}
                      onChange={(e) => updateTeamMember(index, 'slack_webhook', e.target.value)}
                      className="input-field"
                    />
                  </div>
                ))}
              </div>
              <button onClick={addTeamMember} className="btn-secondary w-full">
                + Add Another Team Member
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="border border-gray-200 rounded-lg p-8 bg-white"
            >
              <h2 className="text-2xl font-bold text-black mb-6">Notification Preferences</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    First Reminder (hours before deadline)
                  </label>
                  <input
                    type="number"
                    value={preferences.escalation_rules.first_reminder}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      escalation_rules: { ...preferences.escalation_rules, first_reminder: parseInt(e.target.value) }
                    })}
                    className="input-field"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Second Reminder (hours before deadline)
                  </label>
                  <input
                    type="number"
                    value={preferences.escalation_rules.second_reminder}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      escalation_rules: { ...preferences.escalation_rules, second_reminder: parseInt(e.target.value) }
                    })}
                    className="input-field"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Escalate After (hours past deadline)
                  </label>
                  <input
                    type="number"
                    value={preferences.escalation_rules.escalate_after}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      escalation_rules: { ...preferences.escalation_rules, escalate_after: parseInt(e.target.value) }
                    })}
                    className="input-field"
                    min="1"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-8 gap-4">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="btn-secondary px-8 py-3">
              ← Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={loading}
            className="btn-primary ml-auto disabled:opacity-50 px-8 py-3"
          >
            {loading ? (step === 3 ? 'Completing...' : 'Saving...') : (step === 3 ? 'Complete Setup' : 'Next →')}
          </button>
        </div>
      </div>
    </div>
  )
}
