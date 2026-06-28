import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import DashboardLayout from '@/components/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'

export default function UploadMeeting() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [transcript, setTranscript] = useState('')
  const [aiProvider, setAiProvider] = useState('groq') // Gemini commented out
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState('')
  const [processingTime, setProcessingTime] = useState(0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setProcessingTime(0)

    try {
      const meeting = await api.post('/meetings', { title, transcript, aiProvider })
      setLoading(false)
      setProcessing(true)
      
      const startTime = Date.now()
      const timerInterval = setInterval(() => {
        setProcessingTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
      
      pollMeetingStatus(meeting.id, timerInterval)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const pollMeetingStatus = async (id, timerInterval) => {
    const maxAttempts = 90
    let attempts = 0
    const checkStatus = async () => {
      try {
        attempts++
        const meeting = await api.get(`/meetings/${id}`)
        if (meeting.processing_status === 'completed') {
          clearInterval(timerInterval)
          setProcessing(false)
          setCompleted(true)
          setTimeout(() => navigate('/admin/tasks'), 2000)
        } else if (meeting.processing_status === 'failed') {
          clearInterval(timerInterval)
          setProcessing(false)
          setError('Failed to process meeting. Please try again.')
        } else if (attempts < maxAttempts) {
          setTimeout(checkStatus, 2000)
        } else {
          clearInterval(timerInterval)
          setProcessing(false)
          setError('Processing is taking longer than expected.')
        }
      } catch (err) {
        if (attempts < maxAttempts) setTimeout(checkStatus, 2000)
        else {
          clearInterval(timerInterval)
          setProcessing(false)
          setError('Failed to check processing status.')
        }
      }
    }
    checkStatus()
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => setTranscript(event.target.result)
      reader.readAsText(file)
    }
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '32px 36px', maxWidth: 1200, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            style={{ width: 64, height: 64, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 18, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', boxShadow: 'var(--shadow-md)' }}
          >
            <svg style={{ width: 28, height: 28 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </motion.div>
          <h1 className="page-title" style={{ fontSize: 32, marginBottom: 8 }}>Process Meeting</h1>
          <p className="page-subtitle" style={{ fontSize: 15, maxWidth: 600, margin: '0 auto' }}>
            Upload your raw transcript. Our multi-agent AI framework will extract context and distribute tasks instantly.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28 }}>
          {/* Main Form Area */}
          <div className="card" style={{ padding: 28 }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#f87171', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <span>⚠</span> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="label">Meeting Title <span style={{ color: 'var(--text-tertiary)', fontSize: 11, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                <input
                  type="text"
                  className="input-lg"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Engineering Weekly Sync"
                />
              </div>

              <div>
                <label className="label">AI Provider</label>
                <div className="flex gap-4">
                  {/* { id: 'gemini', name: 'Gemini', desc: 'Balanced performance' }, */}
                  {[
                    { id: 'groq', name: 'Groq', desc: 'Ultra-fast inference (Llama 3)' }
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setAiProvider(p.id)}
                      style={{
                        padding: '16px', borderRadius: 12, textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s ease',
                        background: aiProvider === p.id ? 'var(--bg-elevated)' : 'transparent',
                        border: `1px solid ${aiProvider === p.id ? 'rgba(255,255,255,0.2)' : 'var(--border-default)'}`,
                        boxShadow: aiProvider === p.id ? '0 0 0 1px rgba(255,255,255,0.05)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</div>
                        {aiProvider === p.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                  <label className="label" style={{ marginBottom: 0 }}>Raw Transcript <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <label style={{ cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-overlay)', padding: '6px 12px', borderRadius: 100, border: '1px solid var(--border-default)' }}>
                    <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    Upload .txt
                    <input type="file" accept=".txt,.md" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste the raw meeting conversation here..."
                  className="input custom-scrollbar"
                  style={{ minHeight: 300, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.6 }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || processing || completed || !transcript.trim()}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: 15, justifyContent: 'center' }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="spinner" style={{ width: 16, height: 16 }} /> Submitting...</span>
                ) : processing ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="spinner" style={{ width: 16, height: 16 }} /> Processing with AI...</span>
                ) : completed ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>✓ Completed!</span>
                ) : 'Extract Action Items'}
              </button>

              {processing && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 20, textAlign: 'center', marginTop: -8 }}>
                  <div style={{ color: 'var(--info)', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>AI Agents Working...</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}>Analyzing transcript and extracting tasks</div>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{processingTime}s elapsed</div>
                </motion.div>
              )}

              {completed && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: 20, textAlign: 'center', marginTop: -8 }}>
                  <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Tasks Assigned Successfully!</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Redirecting to tasks page...</div>
                </motion.div>
              )}
            </form>
          </div>

          {/* Right Sidebar Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Intelligence Pipeline</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 16, top: 20, bottom: 20, width: 2, background: 'var(--border-subtle)', zIndex: 0 }} />
                {[
                  { icon: '📝', title: 'Text Analysis', desc: 'LLM parses conversation context.' },
                  { icon: '🎯', title: 'Task Extraction', desc: 'Identifies action items implicitly stated.' },
                  { icon: '🤖', title: 'Smart Assignment', desc: 'Assigns tasks efficiently.' },
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg-surface)', border: '2px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyItems: 'center', fontSize: 16, flexShrink: 0 }}>
                      <span style={{ margin: 'auto' }}>{step.icon}</span>
                    </div>
                    <div style={{ paddingTop: 4 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{step.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 20, background: 'var(--bg-elevated)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Try Demo Transcript</h3>
              </div>
              <div style={{ background: 'var(--bg-base)', padding: 16, borderRadius: 12, border: '1px solid var(--border-default)', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', lineHeight: 1.6, marginBottom: 16 }}>
                <span style={{ color: 'var(--info)' }}>Sarah:</span> We need to fix the login API bug by Friday.<br/>
                <span style={{ color: 'var(--success)' }}>Mike:</span> Sure, I'll work on it.<br/>
                <span style={{ color: 'var(--danger)' }}>John:</span> I will update the docs.
              </div>
              <button
                type="button"
                onClick={() => setTranscript("Sarah: We need to fix the login API bug by Friday.\nMike: Sure, I'll work on it.\nJohn: I will update the documentation for the new endpoints.")}
                className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
              >
                Use Example Data
              </button>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  )
}
