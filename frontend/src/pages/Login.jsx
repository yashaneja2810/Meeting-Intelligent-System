import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'

function AuthLayout({ children, title, subtitle, footer }) {
  return (
    <div
      className="dot-texture stitch-texture"
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-base)', position: 'relative' }}
    >
      <div className="noise-overlay" />
      {/* Ambient glows */}
      <div style={{ position: 'fixed', top: '10%', left: '20%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'rgba(180,180,255,0.04)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '10%', right: '15%', width: '30vw', height: '30vw', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 48, height: 48, background: '#ffffff', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
              <svg style={{ width: 24, height: 24 }} fill="none" stroke="#0c0c0e" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>AutoExec</span>
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginTop: 20, marginBottom: 6 }}>{title}</h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>{subtitle}</p>
        </div>

        {/* Card */}
        <div
          className="stitch-texture"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 20, padding: '32px 32px 28px', boxShadow: 'var(--shadow-xl)', position: 'relative', overflow: 'hidden' }}
        >
          <div className="noise-overlay" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            {children}
          </div>
        </div>

        {/* Footer link */}
        {footer && (
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-tertiary)' }}>
            {footer}
          </p>
        )}

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/" style={{ fontSize: 12, color: 'var(--text-tertiary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            ← Back to website
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

function ErrorAlert({ message }) {
  if (!message) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}
    >
      <svg style={{ width: 15, height: 15, color: '#ef4444', flexShrink: 0, marginTop: 1 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span style={{ fontSize: 13, color: '#f87171', fontWeight: 500 }}>{message}</span>
    </motion.div>
  )
}

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
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your AutoExec workspace"
      footer={<>Don't have an account? <Link to="/signup" style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>Create one</Link></>}
    >
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ErrorAlert message={error} />

        <FormField label="Email address">
          <input
            type="email"
            className="input-lg"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
          />
        </FormField>

        <FormField label={
          <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Password
            <a href="#" style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500, textDecoration: 'none', letterSpacing: 'normal', textTransform: 'none' }}>Forgot?</a>
          </span>
        }>
          <input
            type="password"
            className="input-lg"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </FormField>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: '100%', padding: '13px', fontSize: 14.5, borderRadius: 11, marginTop: 8, justifyContent: 'center' }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="spinner" style={{ width: 16, height: 16 }} />
              Signing in...
            </span>
          ) : 'Sign In'}
        </button>
      </form>
    </AuthLayout>
  )
}
