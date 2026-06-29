import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const FEATURES = [
  {
    title: 'AI Action Extraction',
    desc: 'Parses every meeting transcript and extracts tasks, deadlines, and owners with precision.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    )
  },
  {
    title: 'Smart Assignment',
    desc: 'Distributes tasks intelligently based on team workload and role.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
      </svg>
    )
  },
  {
    title: 'Live Meeting Rooms',
    desc: 'Real-time video meetings with AI transcription, task capture, and team coordination.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
      </svg>
    )
  },
  {
    title: 'Immutable Audit Trail',
    desc: 'Every action, task change, and decision is logged permanently for full transparency.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    )
  },
  {
    title: 'Progress Tracking',
    desc: 'Real-time dashboards show task status, team velocity, and bottlenecks at a glance.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
      </svg>
    )
  },
  {
    title: 'Completion Requests',
    desc: 'Team members submit completion evidence; managers verify and approve in one click.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
      </svg>
    )
  }
]

const STEPS = [
  { num: '01', title: 'Connect', desc: 'Upload a transcript or join a live meeting room.' },
  { num: '02', title: 'Extract', desc: 'AI agents parse context and identify every action item.' },
  { num: '03', title: 'Assign', desc: 'Tasks auto-assigned based on role, workload, and deadline.' },
  { num: '04', title: 'Track', desc: 'Monitor progress in real-time. Approve completions with evidence.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', minHeight: '100vh', overflowX: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @media (max-width: 768px) {
          .lp-features-grid { grid-template-columns: 1fr !important; }
          .lp-steps-grid { grid-template-columns: 1fr 1fr !important; }
          .lp-mock-stats { grid-template-columns: 1fr 1fr !important; }
          .lp-footer { flex-direction: column; gap: 8px; text-align: center; }
          .lp-connector-line { display: none !important; }
          .lp-cta-card { padding: 48px 24px !important; }
        }
        @media (max-width: 480px) {
          .lp-steps-grid { grid-template-columns: 1fr !important; }
          .lp-mock-stats { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'frosted' : 'bg-transparent border-transparent'}`}
        style={{ borderBottom: scrolled ? '1px solid var(--border-subtle)' : 'none', padding: scrolled ? '12px 0' : '20px 0' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div style={{ width: 30, height: 30, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: 16, height: 16, color: '#0c0c0e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>AutoExec</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')}
              style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-secondary)', padding: '7px 14px', borderRadius: 8, transition: 'color 0.15s', background: 'transparent', border: 'none', cursor: 'pointer' }}
              onMouseOver={e => e.target.style.color = 'var(--text-primary)'}
              onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}
            >Log in</button>
            <button onClick={() => navigate('/signup')} className="btn-primary" style={{ borderRadius: 9, padding: '8px 16px', fontSize: 13.5 }}>
              Get Started →
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="dot-texture" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 120, paddingBottom: 80 }}>
        {/* Ambient glows */}
        <div style={{ position: 'absolute', top: '10%', left: '15%', width: '35vw', height: '35vw', borderRadius: '50%', background: 'rgba(150,150,255,0.06)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: '28vw', height: '28vw', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div className="noise-overlay" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', maxWidth: 800, padding: '0 24px', zIndex: 10 }}
        >
          {/* Status badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 100, padding: '5px 14px', marginBottom: 32, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px rgba(34,197,94,0.6)' }} />
            AI Agent — Available Now
          </div>

          <h1 style={{ fontSize: 'clamp(44px, 7vw, 80px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: 24, color: 'var(--text-primary)' }}>
            Turn meetings into{' '}
            <span className="gradient-text">executed action.</span>
          </h1>

          <p style={{ fontSize: 18, fontWeight: 400, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.65 }}>
            AutoExec parses your transcripts, extracts every action item, assigns them to the right people, and tracks completion — automatically.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={() => navigate('/signup')} className="btn-primary" style={{ padding: '13px 28px', fontSize: 15, borderRadius: 12 }}>
              Start Free Trial
            </button>
            <button onClick={() => navigate('/login')} className="btn-secondary" style={{ padding: '13px 28px', fontSize: 15, borderRadius: 12 }}>
              Sign in to Dashboard
            </button>
          </div>

          {/* Metrics strip */}
          <div className="flex items-center justify-center gap-8 flex-wrap" style={{ marginTop: 56 }}>
            {[['10×', 'Faster task creation'], ['100%', 'Audit coverage'], ['∞', 'Meeting types']].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{val}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Hero card mockup */}
        <motion.div
          style={{ y: heroY, marginTop: 64, width: '90%', maxWidth: 960, borderRadius: 20, border: '1px solid var(--border-default)', background: 'var(--bg-surface)', boxShadow: '0 40px 120px rgba(0,0,0,0.7)', overflow: 'hidden', zIndex: 10, position: 'relative' }}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="stitch-texture"
        >
          {/* Mock header bar */}
          <div style={{ padding: '12px 20px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#ef4444','#f59e0b','#22c55e'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: 'var(--bg-overlay)', borderRadius: 6, padding: '3px 16px', fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                app.autoexec.ai/admin/dashboard
              </div>
            </div>
          </div>

          {/* Dashboard mock content */}
          <div className="lp-mock-stats" style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
            {[
              { label: 'Total Tasks', val: '248', color: '#fff' },
              { label: 'In Progress', val: '64', color: '#f59e0b' },
              { label: 'Completed', val: '177', color: '#22c55e' },
              { label: 'Team Members', val: '12', color: '#60a5fa' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color, letterSpacing: '-0.02em' }}>{s.val}</div>
              </div>
            ))}
          </div>
          {/* Mock task list */}
          <div style={{ padding: '0 24px 24px' }}>
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>Recent Tasks</span>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>View all →</span>
              </div>
              {[
                { t: 'Finalize Q3 product roadmap', u: 'Sarah K.', s: 'In Progress', c: '#f59e0b' },
                { t: 'Review design system PR', u: 'Mike R.', s: 'Pending', c: 'var(--text-tertiary)' },
                { t: 'Update stakeholder deck', u: 'Priya M.', s: 'Completed', c: '#22c55e' },
              ].map((task, i) => (
                <div key={i} style={{ padding: '11px 16px', borderBottom: i < 2 ? '1px solid var(--border-subtle)' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)' }}>{task.t}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{task.u}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: task.c }}>{task.s}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── FEATURES GRID ── */}
      <section style={{ padding: '100px 32px', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 100, padding: '4px 12px', marginBottom: 16, fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Platform Features
          </div>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14, lineHeight: 1.1 }}>
            Built for real teams.
          </h2>
          <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
            Everything you need to go from recorded meeting to completed action items — in minutes.
          </p>
        </motion.div>

        <div className="lp-features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="card"
              style={{ padding: 28, position: 'relative', overflow: 'hidden' }}
            >
              <div className="noise-overlay" />
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--bg-overlay)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: 'var(--text-primary)', flexShrink: 0 }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.01em' }}>{f.title}</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '100px 32px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 72, lineHeight: 1.1 }}>
            How it works.
          </h2>
          <div className="lp-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, position: 'relative' }}>
            {/* Connector line */}
            <div className="lp-connector-line" style={{ position: 'absolute', top: 24, left: '12%', right: '12%', height: 1, background: 'var(--border-subtle)', zIndex: 0 }} />
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ position: 'relative', zIndex: 1 }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--bg-overlay)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '100px 32px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="stitch-texture lp-cta-card"
            style={{ maxWidth: 700, margin: '0 auto', padding: '72px 48px', borderRadius: 24, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xl)', position: 'relative', overflow: 'hidden' }}
          >
            <div className="noise-overlay" />
            {/* Glow blob */}
            <div style={{ position: 'absolute', top: '-30%', left: '30%', width: '40%', height: '100%', background: 'rgba(255,255,255,0.03)', filter: 'blur(60px)', borderRadius: '50%', pointerEvents: 'none' }} />
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.1, position: 'relative' }}>
              Ready to automate your workflow?
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 36, lineHeight: 1.6, position: 'relative' }}>
              Join teams already using AutoExec to transform meetings into results.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap" style={{ position: 'relative' }}>
              <button onClick={() => navigate('/signup')} className="btn-primary" style={{ padding: '13px 28px', fontSize: 15, borderRadius: 12 }}>
                Start Free Trial
              </button>
              <button onClick={() => navigate('/login')} className="btn-secondary" style={{ padding: '13px 28px', fontSize: 15, borderRadius: 12 }}>
                Sign In
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer" style={{ padding: '24px 32px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, background: '#fff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ width: 12, height: 12 }} fill="none" stroke="#0c0c0e" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>AutoExec AI</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>© 2025 AutoExec. All rights reserved.</p>
      </footer>
    </div>
  )
}