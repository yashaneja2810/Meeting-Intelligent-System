import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import DashboardLayout from '../components/DashboardLayout'
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
      navigate('/dashboard/tasks')
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Upload Meeting</h1>
        <p className="text-gray-600 mb-8">
          Upload or paste your meeting transcript to extract tasks automatically
        </p>

        <div className="max-w-3xl">
          <form onSubmit={handleSubmit} className="liquid-glass p-8">
            {error && (
              <div className="bg-gray-100 border border-gray-300 text-gray-800 p-3 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Sprint Planning - Jan 2024"
                className="input-field"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transcript
              </label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste your meeting transcript here..."
                className="input-field min-h-[300px] font-mono text-sm"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Upload File
              </label>
              <input
                type="file"
                accept=".txt,.md"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200"
              />
            </div>

            <div className="glass-card p-4 mb-6">
              <h3 className="font-medium text-black mb-2">💡 How it works</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• AI analyzes your meeting transcript</li>
                <li>• Extracts actionable tasks automatically</li>
                <li>• Assigns tasks to team members based on roles and skills</li>
                <li>• Sets up tracking and notifications</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !transcript.trim()}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Process Meeting'}
              </button>
            </div>
          </form>

          {/* Example Transcript */}
          <div className="liquid-glass p-8 mt-6">
            <h3 className="font-semibold mb-3 text-black">Example Transcript</h3>
            <div className="glass-card p-4 text-sm font-mono text-gray-700">
              <p className="mb-2">John: We need to fix the login bug by Friday. Sarah, can you handle that?</p>
              <p className="mb-2">Sarah: Sure, I'll work on it.</p>
              <p className="mb-2">Mike: I'll update the API documentation this week.</p>
              <p>John: Great. Also, someone needs to review the new design mockups ASAP.</p>
            </div>
            <button
              onClick={() => setTranscript("John: We need to fix the login bug by Friday. Sarah, can you handle that?\nSarah: Sure, I'll work on it.\nMike: I'll update the API documentation this week.\nJohn: Great. Also, someone needs to review the new design mockups ASAP.")}
              className="text-black text-sm hover:underline mt-3 font-medium"
            >
              Use this example
            </button>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}
