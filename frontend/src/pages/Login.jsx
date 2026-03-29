import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAFAFA] selection:bg-indigo-500/30 selection:text-indigo-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none -z-10"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/40 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] z-10"
      >
        {/* Logo Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-6 hover:scale-105 transition-transform duration-400 ease-out group">
            <div className="w-16 h-16 rounded-[1.2rem] flex items-center justify-center mx-auto shadow-[0_8px_20px_rgba(0,0,0,0.12)] bg-gradient-to-b from-gray-800 to-gray-900 ring-1 ring-inset ring-white/10 group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.2)] transition-shadow">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </Link>
          <h1 className="text-[32px] font-extrabold tracking-tight text-gray-900 mb-2 leading-tight">Sign in to AutoExec</h1>
          <p className="text-gray-500 font-medium text-[15px]">Please enter your details to continue.</p>
        </div>

        {/* Premium Login Card */}
        <div className="bg-white rounded-[2rem] p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-gray-200/60 relative overflow-hidden backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 ring-1 ring-inset ring-rose-500/20 text-rose-600 p-4 rounded-xl text-[13px] font-bold flex gap-3 items-start shadow-sm"
              >
                <svg className="w-5 h-5 shrink-0 opacity-80 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-gray-200/80 rounded-2xl text-[15px] font-semibold text-gray-900 px-5 py-4 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-gray-300 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
                placeholder="name@company.com"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1 mr-1">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Password
                </label>
                <a href="#" className="text-[12px] font-bold text-gray-500 hover:text-indigo-600 transition-colors" tabIndex="-1">
                  Forgot?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-gray-200/80 rounded-2xl text-[15px] font-mono tracking-widest text-gray-900 px-5 py-4 placeholder:font-sans placeholder:tracking-normal placeholder:text-[15px] placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-gray-300 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white font-bold text-[15px] py-4 rounded-xl shadow-[0_4px_14px_0_rgb(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-0.5 mt-8 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex justify-center items-center"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2.5">
                  <div className="w-5 h-5 border-[3px] border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100/80 text-center relative z-10">
            <p className="text-gray-500 font-medium text-[14px]">
              Don't have an account?{' '}
              <Link to="/signup" className="text-gray-900 font-bold hover:text-indigo-600 transition-colors">
                Create one now
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link to="/" className="text-gray-400 hover:text-gray-900 text-[13px] font-bold transition-colors flex items-center justify-center gap-2 group">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Website
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
