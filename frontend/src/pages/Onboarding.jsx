import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import AlertDialog from '@/components/AlertDialog'

export default function Onboarding() {
  const navigate = useNavigate()
  const { setProfile } = useAuthStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [alertDialog, setAlertDialog] = useState(null)

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
        setAlertDialog({ 
          title: 'Profile Update Failed', 
          message: err.message, 
          variant: 'error' 
        })
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
      setAlertDialog({ 
        title: 'Setup Failed', 
        message: err.message, 
        variant: 'error' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-6 py-12 bg-[#FAFAFA] flex flex-col pt-12 md:pt-24 pb-20 relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-900">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none -z-10"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/40 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_20px_rgba(0,0,0,0.12)] bg-gradient-to-b from-gray-800 to-gray-900 ring-1 ring-inset ring-white/10"
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </motion.div>
          <h1 className="text-[36px] font-extrabold text-gray-900 tracking-tight mb-3">Welcome to AutoExec</h1>
          <p className="text-gray-500 font-medium text-[16px]">Let's set up your workspace for intelligent automation.</p>
        </div>

        {/* Premium Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between relative max-w-[320px] mx-auto z-10">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black shadow-sm transition-all duration-300 ${step > num ? 'bg-gray-900 text-white scale-90' :
                  step === num ? 'bg-gray-900 text-white ring-4 ring-indigo-500/20 scale-110 shadow-[0_4px_14px_0_rgb(0,0,0,0.15)]' :
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
                className="h-full bg-gray-900 transition-all duration-500 ease-in-out"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between max-w-[340px] mx-auto mt-4 px-2">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>Profile</span>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>Team</span>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>Settings</span>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-gray-200/60 flex-1 relative overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">

            {/* Step 1: Profile */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8 flex-1"
              >
                <div>
                  <h2 className="text-[24px] font-extrabold text-gray-900 tracking-tight mb-2">Profile Information</h2>
                  <p className="text-gray-500 font-medium">Tell us a bit about yourself and your organization.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Your Name</label>
                    <input
                      type="text"
                      value={profileData.display_name}
                      onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                      className="w-full bg-[#FAFAFA] border border-gray-200/80 rounded-2xl text-[15px] font-semibold text-gray-900 px-5 py-4 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-gray-300 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Company Name</label>
                    <input
                      type="text"
                      value={profileData.company_name}
                      onChange={(e) => setProfileData({ ...profileData, company_name: e.target.value })}
                      className="w-full bg-[#FAFAFA] border border-gray-200/80 rounded-2xl text-[15px] font-semibold text-gray-900 px-5 py-4 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-gray-300 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
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
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8 flex-1 flex flex-col"
              >
                <div>
                  <h2 className="text-[24px] font-extrabold text-gray-900 tracking-tight mb-2">Invite Your Team</h2>
                  <p className="text-gray-500 font-medium">Add members so AutoExec can start assigning tasks. (Optional)</p>
                </div>

                <div className="space-y-6 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
                  <AnimatePresence>
                    {teamMembers.map((member, index) => (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        key={index}
                        className="bg-[#FAFAFA] border border-gray-200/80 rounded-3xl p-6 space-y-4 relative group shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[14px] font-bold text-gray-900 tracking-tight flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-[11px] font-black">{index + 1}</span>
                            Team Member
                          </span>
                          {teamMembers.length > 1 && (
                            <button
                              onClick={() => removeTeamMember(index)}
                              className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-rose-500 shadow-sm border border-gray-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-colors"
                              title="Remove member"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={member.name}
                            onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                            className="w-full bg-white border border-gray-200/80 rounded-xl text-[14px] font-semibold text-gray-900 px-4 py-3 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          />
                          <input
                            type="email"
                            placeholder="Email Address"
                            value={member.email}
                            onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                            className="w-full bg-white border border-gray-200/80 rounded-xl text-[14px] font-semibold text-gray-900 px-4 py-3 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Role (e.g., Backend Developer)"
                          value={member.role}
                          onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                          className="w-full bg-white border border-gray-200/80 rounded-xl text-[14px] font-semibold text-gray-900 px-4 py-3 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                        <input
                          type="text"
                          placeholder="Skills (comma-separated for AI matching)"
                          value={member.skills}
                          onChange={(e) => updateTeamMember(index, 'skills', e.target.value)}
                          className="w-full bg-white border border-gray-200/80 rounded-xl text-[14px] font-semibold text-gray-900 px-4 py-3 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="pt-2">
                  <button onClick={addTeamMember} className="w-full py-4 border-dashed border-2 border-gray-300 rounded-2xl hover:bg-gray-50 text-gray-600 hover:text-gray-900 hover:border-gray-400 flex items-center justify-center gap-2 text-[14px] font-bold transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Add Another Member
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Settings */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8 flex-1"
              >
                <div>
                  <h2 className="text-[24px] font-extrabold text-gray-900 tracking-tight mb-2">Notification Preferences</h2>
                  <p className="text-gray-500 font-medium">Configure how AutoExec handles task deadlines and escalations.</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#FAFAFA] p-6 rounded-3xl border border-gray-200/80 flex items-center justify-between shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] transition-colors hover:border-gray-300">
                    <div>
                      <h4 className="font-bold text-gray-900 text-[15px] tracking-tight mb-1">First Reminder</h4>
                      <p className="text-[13px] text-gray-500 font-medium">Hours before deadline</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={preferences.escalation_rules.first_reminder}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          escalation_rules: { ...preferences.escalation_rules, first_reminder: parseInt(e.target.value) }
                        })}
                        className="bg-white border border-gray-200 rounded-xl py-2 w-20 text-center font-bold text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                        min="1"
                      />
                      <span className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">hrs</span>
                    </div>
                  </div>

                  <div className="bg-[#FAFAFA] p-6 rounded-3xl border border-gray-200/80 flex items-center justify-between shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] transition-colors hover:border-gray-300">
                    <div>
                      <h4 className="font-bold text-gray-900 text-[15px] tracking-tight mb-1">Second Reminder</h4>
                      <p className="text-[13px] text-gray-500 font-medium">Hours before deadline</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={preferences.escalation_rules.second_reminder}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          escalation_rules: { ...preferences.escalation_rules, second_reminder: parseInt(e.target.value) }
                        })}
                        className="bg-white border border-gray-200 rounded-xl py-2 w-20 text-center font-bold text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                        min="1"
                      />
                      <span className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">hrs</span>
                    </div>
                  </div>

                  <div className="bg-rose-50/50 p-6 rounded-3xl border border-rose-100 flex items-center justify-between transition-colors hover:border-rose-200">
                    <div>
                      <h4 className="font-bold text-rose-600 text-[15px] tracking-tight mb-1">Escalate Task</h4>
                      <p className="text-[13px] text-rose-400/80 font-medium">Hours past deadline</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={preferences.escalation_rules.escalate_after}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          escalation_rules: { ...preferences.escalation_rules, escalate_after: parseInt(e.target.value) }
                        })}
                        className="bg-white border border-rose-200 text-rose-600 rounded-xl py-2 w-20 text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-sm"
                        min="1"
                      />
                      <span className="text-[13px] font-bold text-rose-400 uppercase tracking-widest">hrs</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons footer inside card */}
          <div className="mt-auto pt-10 border-t border-gray-100/80 flex justify-between gap-4 items-center">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="text-gray-500 hover:text-gray-900 font-bold text-[14px] flex items-center gap-2 transition-colors py-2 px-4 -ml-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                Back element
              </button>
            ) : (
              <div></div> // Empty div to keep alignment
            )}

            <button
              onClick={handleNext}
              disabled={loading}
              className="bg-gray-900 text-white font-bold text-[15px] px-8 py-4 rounded-xl shadow-[0_4px_14px_0_rgb(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:bg-gray-800 transition-all hover:-translate-y-0.5 ml-auto disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-[3px] border-white/20 border-t-white rounded-full animate-spin"></div>
                  {step === 3 ? 'Finalizing...' : 'Saving...'}
                </>
              ) : step === 3 ? (
                <>Complete Setup <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg></>
              ) : (
                <>Continue <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg></>
              )}
            </button>
          </div>
        </div>
      </div>

      <AlertDialog 
        isOpen={!!alertDialog} 
        onClose={() => setAlertDialog(null)} 
        title={alertDialog?.title} 
        message={alertDialog?.message} 
        variant={alertDialog?.variant} 
      />
    </div>
  )
}
