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
      <div style={{ position: 'fixed', top: '10%', left: '20%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'rgba(180,180,255,0.04)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '10%', right: '15%', width: '30vw', height: '30vw', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}
      >
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

        <div className="stitch-texture" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 20, padding: '32px 32px 28px', boxShadow: 'var(--shadow-xl)', position: 'relative', overflow: 'hidden' }}>
          <div className="noise-overlay" />
          <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
        </div>

        {footer && <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-tertiary)' }}>{footer}</p>}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/" style={{ fontSize: 12, color: 'var(--text-tertiary)', textDecoration: 'none' }}>← Back to website</Link>
        </div>
      </motion.div>
    </div>
  )
}

function FormField({ label, hint, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 5, fontWeight: 400 }}>{hint}</p>}
    </div>
  )
}

function ErrorAlert({ message }) {
  if (!message) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 4 }}
    >
      <svg style={{ width: 15, height: 15, color: '#ef4444', flexShrink: 0, marginTop: 1 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span style={{ fontSize: 13, color: '#f87171', fontWeight: 500 }}>{message}</span>
    </motion.div>
  )
}

export default function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '', displayName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      })
      if (authError) throw authError

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/create-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.session.access_token}`
        },
        body: JSON.stringify({ id: authData.user.id, email: formData.email, displayName: formData.displayName })
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create profile')
      }
      navigate('/onboarding')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const set = (k) => (e) => setFormData(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start automating your meetings today"
      footer={<>Already have an account? <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link></>}
    >
      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ErrorAlert message={error} />

        <FormField label="Full name">
          <input
            type="text"
            className="input-lg"
            value={formData.displayName}
            onChange={set('displayName')}
            placeholder="John Doe"
            required
          />
        </FormField>

        <FormField label="Work email">
          <input
            type="email"
            className="input-lg"
            value={formData.email}
            onChange={set('email')}
            placeholder="you@company.com"
            required
          />
        </FormField>

        <FormField label="Password" hint="Must be at least 6 characters">
          <input
            type="password"
            className="input-lg"
            value={formData.password}
            onChange={set('password')}
            placeholder="••••••••"
            minLength={6}
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
              Creating account...
            </span>
          ) : 'Create Account →'}
        </button>

        <p style={{ fontSize: 11.5, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 4 }}>
          By creating an account, you agree to our Terms of Service.
        </p>
      </form>
    </AuthLayout>
  )
}
