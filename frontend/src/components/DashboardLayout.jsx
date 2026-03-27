import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore.js'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InviteNotification from './InviteNotification.jsx'

export default function DashboardLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, logout } = useAuthStore()
  const [activeWorkspace, setActiveWorkspace] = useState('admin')

  useEffect(() => {
    if (location.pathname.startsWith('/employee')) {
      setActiveWorkspace('employee')
    } else {
      setActiveWorkspace('admin')
    }
  }, [location.pathname])

  const adminNavigation = [
    {
      name: 'Overview', path: '/admin/dashboard', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      name: 'Upload Meeting', path: '/admin/upload', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      )
    },
    {
      name: 'All Tasks', path: '/admin/tasks', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      name: 'Team', path: '/admin/team', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      name: 'Audit Logs', path: '/admin/audit', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      name: 'Invites', path: '/admin/invites', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    }
  ]

  const employeeNavigation = [
    {
      name: 'My Tasks', path: '/employee/tasks', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    {
      name: 'Organizations', path: '/employee/organizations', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      name: 'Invitations', path: '/employee/invites', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
        </svg>
      )
    }
  ]

  const currentNav = activeWorkspace === 'admin' ? adminNavigation : employeeNavigation

  return (
    <div className="min-h-screen bg-apple-gray text-apple-dark font-sans relative">
      <InviteNotification />

      {/* Sidebar - Solid Apple Surface */}
      <div className="fixed inset-y-0 left-0 w-64 z-50">
        <div className="h-full bg-white m-4 rounded-2xl p-6 flex flex-col shadow-apple border border-gray-100">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-black leading-none">AutoExec</span>
                <span className="text-[11px] font-semibold tracking-wider text-gray-400 mt-1 uppercase">Workspace</span>
              </div>
            </div>
          </div>

          {/* Workspace Switcher - Segmented Control Style */}
          <div className="mb-8 bg-gray-100/80 p-1 rounded-xl flex">
            <button
              onClick={() => {
                setActiveWorkspace('admin')
                navigate('/admin/dashboard')
              }}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${activeWorkspace === 'admin'
                  ? 'bg-white text-black shadow-sm border border-gray-200/50'
                  : 'text-gray-500 hover:text-black'
                }`}
            >
              Admin
            </button>
            <button
              onClick={() => {
                setActiveWorkspace('employee')
                navigate('/employee/tasks')
              }}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${activeWorkspace === 'employee'
                  ? 'bg-white text-black shadow-sm border border-gray-200/50'
                  : 'text-gray-500 hover:text-black'
                }`}
            >
              Employee
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
            {currentNav.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${isActive
                      ? 'bg-black text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                    }`}
                >
                  <div className={`transition-transform duration-300 ${isActive ? 'scale-100 text-white' : 'scale-95 group-hover:scale-110'}`}>
                    {item.icon}
                  </div>
                  <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-black'}`}>
                    {item.name}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-black rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Profile - Solid Footer */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100/80 hover:bg-gray-100 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {profile?.display_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-black truncate">
                    {profile?.display_name || 'User Profile'}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">{profile?.email}</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  await logout()
                  navigate('/login')
                }}
                className="w-full text-xs text-gray-500 hover:text-red-500 py-1.5 transition-colors font-medium flex items-center justify-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pl-72 pr-8 py-8 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-[1400px] mx-auto"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
