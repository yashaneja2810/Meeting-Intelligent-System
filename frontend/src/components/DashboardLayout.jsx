import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InviteNotification from '@/components/InviteNotification'

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
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      )
    },
    {
      name: 'Upload Meeting', path: '/admin/upload', icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
      )
    },
    {
      name: 'All Tasks', path: '/admin/tasks', icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
      )
    },
    {
      name: 'Team', path: '/admin/team', icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
      )
    },
    {
      name: 'Audit Logs', path: '/admin/audit', icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      )
    },
    {
      name: 'Invites', path: '/admin/invites', icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
      )
    }
  ]

  const employeeNavigation = [
    {
      name: 'My Tasks', path: '/employee/tasks', icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
      )
    },
    {
      name: 'Organizations', path: '/employee/organizations', icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
      )
    },
    {
      name: 'Invitations', path: '/employee/invites', icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" /></svg>
      )
    }
  ]

  const currentNav = activeWorkspace === 'admin' ? adminNavigation : employeeNavigation

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 font-sans relative flex">
      <InviteNotification />

      {/* Sidebar - Flush, subtle background pane */}
      <div className="w-64 fixed inset-y-0 left-0 bg-[#F8F9FA] border-r border-gray-200/60 z-50 flex flex-col">
        <div className="p-6 flex flex-col h-full">

          {/* Logo */}
          <div className="mb-8 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 bg-gray-900 rounded-[10px] flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[17px] font-extrabold tracking-tight text-gray-900 leading-none">AutoExec</span>
              <span className="text-[11px] font-semibold tracking-wider text-gray-500 mt-1 uppercase">Workspace</span>
            </div>
          </div>

          {/* Workspace Switcher - Native iOS Style */}
          <div className="mb-8 bg-gray-200/50 p-1 rounded-xl flex shadow-inner">
            <button
              onClick={() => {
                setActiveWorkspace('admin')
                navigate('/admin/dashboard')
              }}
              className={`flex-1 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-300 ${activeWorkspace === 'admin'
                ? 'bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Admin
            </button>
            <button
              onClick={() => {
                setActiveWorkspace('employee')
                navigate('/employee/tasks')
              }}
              className={`flex-1 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-300 ${activeWorkspace === 'employee'
                ? 'bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Employee
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
            {currentNav.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-200 relative group overflow-hidden ${isActive
                    ? 'bg-white text-indigo-700 shadow-[0_1px_4px_rgba(0,0,0,0.04)] ring-1 ring-gray-200/50'
                    : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-900'
                    }`}
                >
                  <div className={`transition-transform duration-300 ${isActive ? 'scale-100 text-indigo-600' : 'scale-95 group-hover:scale-100'}`}>
                    {item.icon}
                  </div>
                  <span className={`text-[14px] font-semibold tracking-tight ${isActive ? 'text-gray-900' : ''}`}>
                    {item.name}
                  </span>

                  {/* Subtle active indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 rounded-r-full"></div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Profile Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200/60">
            <div className="bg-white p-3 rounded-xl border border-gray-200/50 hover:border-gray-300 shadow-sm transition-colors cursor-pointer group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-inner">
                  {profile?.display_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-gray-900 truncate tracking-tight">
                    {profile?.display_name || 'User Profile'}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate font-medium">{profile?.email}</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  await logout()
                  navigate('/login')
                }}
                className="w-full text-[12px] text-gray-500 hover:bg-red-50 hover:text-red-600 py-1.5 rounded-md transition-colors font-semibold flex items-center justify-center gap-1.5"
              >
                Sign Out
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="ml-64 flex-1 min-h-screen">
        <div className="w-full h-full">
          {children}
        </div>
      </div>

    </div>
  )
}
