import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api.js'
import { useAuthStore } from '@/store/authStore.js'
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
    <div className="min-h-screen px-6 py-12 bg-apple-gray flex flex-col pt-12 md:pt-24 pb-20">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="w-20 h-20 bg-black rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-apple"
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </motion.div>
          <h1 className="text-4xl font-bold text-black tracking-tight mb-3">Welcome to AutoExec</h1>
          <p className="text-gray-500 font-medium text-lg">Let's set up your workspace for intelligent automation.</p>
        </div>

        {/* Progress Bar (Apple Install UI style) */}
        <div className="mb-12">
          <div className="flex justify-between relative max-w-sm mx-auto z-10">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-all duration-300 ${step > num ? 'bg-black text-white scale-90' :
                    step === num ? 'bg-black text-white ring-4 ring-black/10 scale-110' :
                      'bg-white text-gray-400 border border-gray-200'
                  }`}>
                  {step > num ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  ) : num}
                </div>
              </div>
            ))}
            {/* Connecting lines */}
            <div className="absolute top-4 left-0 right-0 h-[2px] bg-gray-200 -z-10 mx-6 translate-y-[-1px]">
              <div
                className="h-full bg-black transition-all duration-500 ease-in-out"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between max-w-sm mx-auto mt-3 px-1">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${step >= 1 ? 'text-black' : 'text-gray-400'}`}>Profile</span>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${step >= 2 ? 'text-black' : 'text-gray-400'}`}>Team</span>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${step >= 3 ? 'text-black' : 'text-gray-400'}`}>Settings</span>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="surface flex-1 p-8 md:p-12 shadow-2xl shadow-black/5 ring-1 ring-black/5 border-transparent relative overflow-hidden">
          <AnimatePresence mode="wait">

            {/* Step 1: Profile */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-black tracking-tight mb-2">Profile Information</h2>
                  <p className="text-gray-500 font-medium">Tell us a bit about yourself and your organization.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Your Name</label>
                    <input
                      type="text"
                      value={profileData.display_name}
                      onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                      className="input-field bg-gray-50/50 py-3.5"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Company Name</label>
                    <input
                      type="text"
                      value={profileData.company_name}
                      onChange={(e) => setProfileData({ ...profileData, company_name: e.target.value })}
                      className="input-field bg-gray-50/50 py-3.5"
                      placeholder="Acme Inc."
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Team */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-black tracking-tight mb-2">Invite Your Team</h2>
                  <p className="text-gray-500 font-medium">Add members so AutoExec can start assigning tasks. (Optional)</p>
                </div>

                <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  <AnimatePresence>
                    {teamMembers.map((member, index) => (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        key={index}
                        className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 space-y-4 relative group"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-bold text-black tracking-tight flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs">{index + 1}</span>
                            Team Member
                          </span>
                          {teamMembers.length > 1 && (
                            <button
                              onClick={() => removeTeamMember(index)}
                              className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-red-500 shadow-sm border border-gray-100 hover:bg-red-50 hover:border-red-200 transition-colors"
                              title="Remove member"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={member.name}
                            onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                            className="input-field bg-white py-2.5 text-sm"
                          />
                          <input
                            type="email"
                            placeholder="Email Address"
                            value={member.email}
                            onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                            className="input-field bg-white py-2.5 text-sm"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Role (e.g., Backend Developer)"
                          value={member.role}
                          onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                          className="input-field bg-white py-2.5 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Skills (comma-separated for AI matching)"
                          value={member.skills}
                          onChange={(e) => updateTeamMember(index, 'skills', e.target.value)}
                          className="input-field bg-white py-2.5 text-sm"
                        />
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Slack Webhook URL (optional)"
                            value={member.slack_webhook}
                            onChange={(e) => updateTeamMember(index, 'slack_webhook', e.target.value)}
                            className="input-field bg-white py-2.5 text-sm pl-9"
                          />
                          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-[11px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <button onClick={addTeamMember} className="btn-secondary w-full py-3.5 border-dashed border-2 hover:bg-gray-50 flex items-center justify-center gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  Add Another Member
                </button>
              </motion.div>
            )}

            {/* Step 3: Settings */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-black tracking-tight mb-2">Notification Preferences</h2>
                  <p className="text-gray-500 font-medium">Configure how AutoExec handles task deadlines and escalations.</p>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-black text-sm tracking-tight mb-1">First Reminder</h4>
                      <p className="text-xs text-gray-500 font-medium mt-1">Hours before deadline</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={preferences.escalation_rules.first_reminder}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          escalation_rules: { ...preferences.escalation_rules, first_reminder: parseInt(e.target.value) }
                        })}
                        className="input-field bg-white py-2 w-20 text-center font-bold text-lg"
                        min="1"
                      />
                      <span className="text-sm font-bold text-gray-400">hrs</span>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-black text-sm tracking-tight mb-1">Second Reminder</h4>
                      <p className="text-xs text-gray-500 font-medium mt-1">Hours before deadline</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={preferences.escalation_rules.second_reminder}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          escalation_rules: { ...preferences.escalation_rules, second_reminder: parseInt(e.target.value) }
                        })}
                        className="input-field bg-white py-2 w-20 text-center font-bold text-lg"
                        min="1"
                      />
                      <span className="text-sm font-bold text-gray-400">hrs</span>
                    </div>
                  </div>

                  <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-red-600 text-sm tracking-tight mb-1">Escalate Task</h4>
                      <p className="text-xs text-red-400/80 font-medium mt-1">Hours past deadline</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={preferences.escalation_rules.escalate_after}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          escalation_rules: { ...preferences.escalation_rules, escalate_after: parseInt(e.target.value) }
                        })}
                        className="input-field bg-white border-red-200 text-red-600 py-2 w-20 text-center font-bold text-lg focus:border-red-400 focus:ring-red-400"
                        min="1"
                      />
                      <span className="text-sm font-bold text-red-400">hrs</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons footer inside card */}
          <div className="mt-10 pt-8 border-t border-gray-100 flex justify-between gap-4 items-center">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="text-gray-500 hover:text-black font-semibold text-sm flex items-center gap-2 transition-colors py-2 px-4 -ml-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>
            ) : (
              <div></div> // Empty div to keep alignment
            )}

            <button
              onClick={handleNext}
              disabled={loading}
              className="btn-primary ml-auto shadow-md hover:shadow-lg disabled:opacity-50 disabled:scale-100 px-8 py-3.5 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  {step === 3 ? 'Finalizing...' : 'Saving...'}
                </>
              ) : step === 3 ? (
                <>Complete Setup <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></>
              ) : (
                <>Continue <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
