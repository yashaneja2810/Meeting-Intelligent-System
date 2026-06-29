import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InviteNotification from '@/components/InviteNotification'

/* ─── Navigation Config ─── */
const ADMIN_NAV = [
  {
    section: 'Overview',
    items: [
      {
        name: 'Dashboard', path: '/admin/dashboard',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>
      }
    ]
  },
  {
    section: 'Meetings',
    items: [
      {
        name: 'Live Meetings', path: '/live-meetings',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>,
        badge: 'Live'
      },
      {
        name: 'Upload Meeting', path: '/admin/upload',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
      }
    ]
  },
  {
    section: 'Management',
    items: [
      {
        name: 'All Tasks', path: '/admin/tasks',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
      },
      {
        name: 'Team', path: '/admin/team',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      },
      {
        name: 'Invites', path: '/admin/invites',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
      }
    ]
  },
  {
    section: 'System',
    items: [
      {
        name: 'Audit Logs', path: '/admin/audit',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
      }
    ]
  }
]

const EMPLOYEE_NAV = [
  {
    section: 'Work',
    items: [
      {
        name: 'My Tasks', path: '/employee/tasks',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
      },
      {
        name: 'Live Meetings', path: '/live-meetings',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>,
        badge: 'Live'
      }
    ]
  },
  {
    section: 'Organization',
    items: [
      {
        name: 'Organizations', path: '/employee/organizations',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
      },
      {
        name: 'Invitations', path: '/employee/invites',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
      }
    ]
  }
]

// Hook to detect mobile
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= breakpoint)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [breakpoint])
  return isMobile
}

export default function DashboardLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, logout } = useAuthStore()
  const [workspace, setWorkspace] = useState('admin')
  const [loggingOut, setLoggingOut] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    setWorkspace(location.pathname.startsWith('/employee') ? 'employee' : 'admin')
  }, [location.pathname])

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const nav = workspace === 'admin' ? ADMIN_NAV : EMPLOYEE_NAV

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  const sidebarContent = (
    <>
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5 py-5 cursor-pointer flex-shrink-0"
        onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: '#ffffff', color: '#0c0c0e' }}
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} style={{ width: 18, height: 18 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>AutoExec</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>AI Platform</div>
        </div>
        {/* Close button on mobile */}
        {isMobile && (
          <button
            onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(false); }}
            style={{ marginLeft: 'auto', padding: 6, borderRadius: 8, background: 'var(--bg-elevated)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>

      <div className="divider mx-5" />

      {/* Workspace switcher */}
      <div className="px-4 py-3 flex-shrink-0">
        <div className="toggle-pill">
          <button
            onClick={() => { setWorkspace('admin'); navigate('/admin/dashboard'); setMobileMenuOpen(false); }}
            className={`toggle-pill-btn flex-1 ${workspace === 'admin' ? 'active' : ''}`}
          >Admin</button>
          <button
            onClick={() => { setWorkspace('employee'); navigate('/employee/tasks'); setMobileMenuOpen(false); }}
            className={`toggle-pill-btn flex-1 ${workspace === 'employee' ? 'active' : ''}`}
          >Employee</button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar" style={{ paddingTop: 4 }}>
        {nav.map((group) => (
          <div key={group.section} className="mb-4">
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 10px 4px' }}>
              {group.section}
            </div>
            {group.items.map((item) => {
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-item ${active ? 'active' : ''} mb-0.5`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span style={{ color: active ? 'var(--text-primary)' : 'var(--text-tertiary)', display: 'flex', flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.badge && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4,
                      background: 'rgba(34,197,94,0.15)', color: '#4ade80',
                      border: '1px solid rgba(34,197,94,0.2)', letterSpacing: '0.05em'
                    }}>
                      {item.badge}
                    </span>
                  )}
                  {active && (
                    <motion.div
                      layoutId={`indicator-${workspace}`}
                      className="absolute left-0 w-0.5 rounded-r-full"
                      style={{ top: 8, bottom: 8, background: 'rgba(255,255,255,0.5)' }}
                    />
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="flex-shrink-0 px-3 py-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div
          className="flex items-center gap-2.5 p-2.5 rounded-xl transition-colors cursor-pointer group"
          style={{ background: 'var(--bg-elevated)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: '#ffffff', color: '#0c0c0e' }}
          >
            {profile?.display_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }} className="truncate">
              {profile?.display_name || 'User'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }} className="truncate">
              {profile?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex-shrink-0 p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            title="Sign out"
          >
            {loggingOut ? (
              <div className="spinner" style={{ width: 14, height: 14 }} />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <InviteNotification />

      {/* ── MOBILE TOP BAR ── */}
      {isMobile && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 90,
            padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{ padding: 6, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 24, height: 24, background: '#fff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: 12, height: 12 }} fill="none" stroke="#0c0c0e" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em' }}>AutoExec</span>
            </div>
          </div>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: '#ffffff', color: '#0c0c0e' }}
          >
            {profile?.display_name?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      )}

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mobile-sidebar-overlay"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col stitch-texture"
              style={{
                position: 'fixed', inset: '0', width: 280, zIndex: 100,
                background: 'var(--bg-surface)',
                borderRight: '1px solid var(--border-subtle)',
              }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── DESKTOP SIDEBAR ── */}
      {!isMobile && (
        <aside
          className="w-60 fixed inset-y-0 left-0 flex flex-col z-50 stitch-texture"
          style={{
            background: 'var(--bg-surface)',
            borderRight: '1px solid var(--border-subtle)',
          }}
        >
          {sidebarContent}
        </aside>
      )}

      {/* ── MAIN CONTENT ── */}
      <main
        className={`flex-1 min-h-screen overflow-x-hidden dashboard-content ${!isMobile ? 'ml-60' : ''}`}
        style={{ background: 'var(--bg-base)', paddingTop: isMobile ? 52 : 0 }}
      >
        {children}
      </main>
    </div>
  )
}
