import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import DashboardLayout from '@/components/DashboardLayout'
import { motion } from 'framer-motion'

export default function UploadMeeting() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [transcript, setTranscript] = useState('')
  const [aiProvider, setAiProvider] = useState('gemini')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/meetings', { title, transcript, aiProvider })
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
      <div className="max-w-[1200px] mx-auto p-6 md:p-10 lg:p-14">

        {/* Spectacular Header */}
        <div className="mb-14 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-[2rem] mx-auto flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.12)] mb-8 text-white relative group cursor-pointer"
          >
            <div className="absolute inset-0 bg-white/5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <svg className="w-12 h-12 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <div className="absolute -z-10 bg-indigo-500/30 w-full h-full blur-2xl rounded-full scale-125 group-hover:scale-150 transition-transform duration-700"></div>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-4">Process Meeting</h1>
          <p className="text-gray-500 text-xl font-medium tracking-tight max-w-2xl mx-auto">
            Paste your raw transcript below. Our multi-agent AI framework will extract context and distribute tasks instantly.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">

          {/* Main Form Area */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.03)] ring-1 ring-gray-200/60 relative overflow-hidden">
              {/* Top accent glow */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>

              {error && (
                <div className="bg-red-50 text-red-700 border border-red-100 p-4 rounded-xl text-[14px] font-semibold mb-8 flex items-start gap-3 shadow-sm">
                  <svg className="w-5 h-5 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="mb-8">
                <label className="block text-[13px] font-bold text-gray-900 mb-3 ml-1 tracking-tight">
                  Meeting Title <span className="text-gray-400 font-medium">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Engineering Weekly Sync"
                  className="w-full bg-[#FAFAFA] border border-gray-200/80 rounded-2xl text-[16px] font-semibold text-gray-900 px-5 py-4 placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-gray-300 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
                />
              </div>

              <div className="mb-8">
                <label className="block text-[13px] font-bold text-gray-900 mb-3 ml-1 tracking-tight">
                  AI Provider
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAiProvider('gemini')}
                    className={`relative px-5 py-4 rounded-2xl text-[15px] font-bold transition-all border-2 ${
                      aiProvider === 'gemini'
                        ? 'bg-gray-900 text-white border-gray-900 shadow-[0_4px_14px_0_rgb(0,0,0,0.15)]'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                      </svg>
                      Gemini
                    </div>
                    {aiProvider === 'gemini' && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full"></div>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiProvider('groq')}
                    className={`relative px-5 py-4 rounded-2xl text-[15px] font-bold transition-all border-2 ${
                      aiProvider === 'groq'
                        ? 'bg-gray-900 text-white border-gray-900 shadow-[0_4px_14px_0_rgb(0,0,0,0.15)]'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                      </svg>
                      Groq
                    </div>
                    {aiProvider === 'groq' && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full"></div>
                    )}
                  </button>
                </div>
                <p className="text-gray-500 text-[12px] font-medium mt-2 ml-1">
                  {aiProvider === 'gemini' ? 'Google Gemini 2.0 Flash - Balanced performance' : 'Groq Llama 3.3 70B - Ultra-fast inference'}
                </p>
              </div>

              <div className="mb-10">
                <div className="flex justify-between items-end mb-3 ml-1">
                  <label className="block text-[13px] font-bold text-gray-900 tracking-tight">
                    Raw Transcript
                  </label>
                  <label className="cursor-pointer text-[12px] font-bold text-gray-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm hover:shadow">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload .txt
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
                  placeholder="Paste the raw meeting conversation here..."
                  className="w-full bg-[#FAFAFA] border border-gray-200/80 rounded-[1.5rem] min-h-[350px] font-mono text-[14px] leading-relaxed text-gray-700 resize-y p-6 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-gray-300 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !transcript.trim()}
                className="w-full bg-gray-900 text-white font-bold py-5 rounded-2xl text-[16px] shadow-[0_4px_14px_0_rgb(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:bg-gray-800 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none transition-all duration-300"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-[3px] border-white/20 border-t-white rounded-full animate-spin"></div>
                    Executing AI Framework...
                  </span>
                ) : 'Extract Action Items'}
              </button>
            </form>
          </div>

          {/* Right Sidebar Info */}
          <div className="lg:col-span-2 space-y-8">

            {/* How it works cleanly integrated */}
            <div className="bg-white rounded-[2rem] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] ring-1 ring-gray-200/60 relative overflow-hidden">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-full -z-10"></div>

              <h3 className="font-extrabold text-gray-900 mb-8 text-[20px] tracking-tight">Intelligence Pipeline</h3>

              <div className="space-y-8 relative">
                {/* Connecting Line */}
                <div className="absolute left-6 top-6 bottom-6 w-px bg-gray-100 z-0"></div>

                {[
                  { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', title: 'Text Analysis', desc: 'LLM instantly parses entire conversation context.' },
                  { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'Task Extraction', desc: 'Identifies action items implicitly or explicitly stated.' },
                  { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857', title: 'Smart Assignment', desc: 'Calculates workload and assigns tasks efficiently.' },
                ].map((step, i) => (
                  <div key={i} className="flex gap-5 relative z-10 group cursor-default">
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:border-indigo-200 transition-all duration-300">
                      <svg className="w-5 h-5 text-gray-900 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                      </svg>
                    </div>
                    <div className="pt-0.5">
                      <p className="font-bold text-gray-900 text-[15px] mb-1 tracking-tight">{step.title}</p>
                      <p className="text-gray-500 text-[13px] font-medium leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Try Demo Card */}
            <div className="bg-[#FAFAFA] rounded-[2rem] p-8 ring-1 ring-gray-200/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] border border-gray-100 group">
              <h3 className="font-bold mb-4 text-gray-900 text-[17px] tracking-tight flex items-center justify-between">
                Try Demo Transcript
                <svg className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </h3>
              <div className="bg-white p-5 rounded-2xl text-[12px] font-mono text-gray-500 leading-relaxed mb-6 border border-gray-200 shadow-sm">
                <p className="mb-2"><span className="font-bold text-indigo-500">Sarah:</span> We need to fix the login API bug by Friday.</p>
                <p className="mb-2"><span className="font-bold text-emerald-500">Mike:</span> Sure, I'll work on it.</p>
                <p><span className="font-bold text-rose-500">John:</span> I will update the documentation for the new endpoints.</p>
              </div>
              <button
                type="button"
                onClick={() => setTranscript("Sarah: We need to fix the login API bug by Friday.\nMike: Sure, I'll work on it.\nJohn: I will update the documentation for the new endpoints.")}
                className="bg-white border border-gray-200 text-gray-900 text-[14px] font-bold w-full py-4 rounded-xl shadow-sm hover:shadow hover:border-gray-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
              >
                Use Example Data
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
