import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import InviteNotification from './InviteNotification'

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
    { name: 'Overview', path: '/admin/dashboard', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { name: 'Upload Meeting', path: '/admin/upload', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    )},
    { name: 'All Tasks', path: '/admin/tasks', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )},
    { name: 'Team', path: '/admin/team', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )},
    { name: 'Audit Logs', path: '/admin/audit', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
    { name: 'Invites', path: '/admin/invites', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )}
  ]

  const employeeNavigation = [
    { name: 'My Tasks', path: '/employee/tasks', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )},
    { name: 'Organizations', path: '/employee/organizations', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )},
    { name: 'Invitations', path: '/employee/invites', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
      </svg>
    )}
  ]

  const currentNav = activeWorkspace === 'admin' ? adminNavigation : employeeNavigation

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Subtle Static Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-black opacity-[0.015] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black opacity-[0.015] rounded-full blur-3xl"></div>
      </div>

      <InviteNotification />
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 z-50">
        <div className="h-full frosted-glass m-4 rounded-2xl p-6 flex flex-col shadow-xl">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-black">AutoExec AI</h1>
                <p className="text-xs text-gray-500">Intelligent Automation</p>
              </div>
            </div>
          </div>

          {/* Workspace Switcher */}
          <div className="mb-6">
            <div className="glass-card p-1.5 rounded-xl flex gap-1.5">
              <button
                onClick={() => {
                  setActiveWorkspace('admin')
                  navigate('/admin/dashboard')
                }}
                className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeWorkspace === 'admin'
                    ? 'bg-black text-white shadow-lg'
                    : 'text-gray-600 hover:text-black hover:bg-white/50'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => {
                  setActiveWorkspace('employee')
                  navigate('/employee/tasks')
                }}
                className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeWorkspace === 'employee'
                    ? 'bg-black text-white shadow-lg'
                    : 'text-gray-600 hover:text-black hover:bg-white/50'
                }`}
              >
                Employee
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {currentNav.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
                    isActive
                      ? 'glass-card shadow-lg'
                      : 'hover:bg-white/50'
                  }`}
                >
                  <div className={`transition-transform group-hover:scale-110 ${isActive ? 'text-black' : 'text-gray-600'}`}>
                    {item.icon}
                  </div>
                  <span className={`text-sm font-medium ${isActive ? 'text-black' : 'text-gray-700'}`}>
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="mt-6 pt-6 border-t border-gray-200/50">
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {profile?.display_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-black truncate">
                    {profile?.display_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  await logout()
                  navigate('/login')
                }}
                className="w-full text-sm text-gray-600 hover:text-black py-2 hover:bg-white/50 rounded-lg transition-all font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
