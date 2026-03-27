import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { motion } from 'framer-motion'

export default function UploadMeeting() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/meetings', { title, transcript })
      navigate('/admin/tasks')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setTranscript(event.target.result)
      }
      reader.readAsText(file)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1000px] mx-auto">
        <div className="mb-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-20 h-20 bg-black rounded-[2rem] mx-auto flex items-center justify-center shadow-apple mb-6 text-white"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black mb-4">Process Meeting</h1>
          <p className="text-gray-500 text-lg font-medium">
            Paste your transcript. Our AI agents will distribute tasks automatically.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3">
            <form onSubmit={handleSubmit} className="surface p-8 md:p-10 shadow-lg border-transparent">
              {error && (
                <div className="bg-red-50 text-red-600 border border-red-100 p-4 rounded-2xl text-sm font-medium mb-8 flex items-start gap-3">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="mb-8">
                <label className="block text-sm font-bold text-black mb-3 ml-1">
                  Title <span className="text-gray-400 font-medium">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Q3 Planning Session"
                  className="input-field bg-white border-gray-200 text-lg py-4 placeholder:text-gray-300 shadow-sm"
                />
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-end mb-3 ml-1">
                  <label className="block text-sm font-bold text-black">
                    Transcript
                  </label>
                  <label className="cursor-pointer text-xs font-semibold text-gray-500 hover:text-black flex items-center gap-1 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload .txt File
                    <input
                      type="file"
                      accept=".txt,.md"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste the raw meeting transcript here..."
                  className="input-field bg-white border-gray-200 min-h-[350px] font-mono text-sm leading-relaxed resize-y p-6 shadow-sm"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading || !transcript.trim()}
                  className="btn-primary w-full sm:flex-1 py-4 text-lg disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Processing with AI...
                    </span>
                  ) : 'Extract Action Items'}
                </button>
              </div>
            </form>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-gray-100/50 border border-gray-200/60 rounded-[2rem] p-8">
              <h3 className="font-bold text-black mb-6 text-xl tracking-tight">How it works</h3>
              <div className="space-y-6">
                {[
                  { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', title: 'Text Analysis', desc: 'LLM parses conversation context.' },
                  { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'Task Extraction', desc: 'Identifies action items implicitly or explicitly stated.' },
                  { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857', title: 'Smart Assignment', desc: 'Matches tasks to best team member skills.' },
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-black text-sm">{step.title}</p>
                      <p className="text-gray-500 text-sm font-medium">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface p-8 shadow-sm group">
              <h3 className="font-bold mb-4 text-black text-lg tracking-tight">Try Demo Transcript</h3>
              <div className="bg-gray-50 p-4 rounded-xl text-xs font-mono text-gray-500 leading-relaxed mb-4 border border-gray-100">
                <p>Sarah: We need to fix the login API bug by Friday.</p>
                <p>Mike: Sure, I'll work on it.</p>
                <p>John: I will update the documentation for the new endpoints.</p>
              </div>
              <button
                type="button"
                onClick={() => setTranscript("Sarah: We need to fix the login API bug by Friday.\nMike: Sure, I'll work on it.\nJohn: I will update the documentation for the new endpoints.")}
                className="text-black text-sm font-bold w-full text-center hover:opacity-70 transition-opacity"
              >
                Use Example →
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
