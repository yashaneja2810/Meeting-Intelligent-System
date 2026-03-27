import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import LandingPage from '@/pages/LandingPage'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import Onboarding from '@/pages/Onboarding'

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard'
import UploadMeeting from '@/pages/UploadMeeting'
import Tasks from '@/pages/Tasks'
import AuditLogs from '@/pages/AuditLogs'
import TeamManagement from '@/pages/TeamManagement'
import Invites from '@/pages/Invites'

// Employee Pages
import EmployeeDashboard from '@/pages/employee/EmployeeDashboard'
import MyTasks from '@/pages/MyTasks'
import Organizations from '@/pages/employee/Organizations'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>
  }
  
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        
        {/* Redirect /dashboard to admin dashboard */}
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/upload" element={<ProtectedRoute><UploadMeeting /></ProtectedRoute>} />
        <Route path="/admin/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
        <Route path="/admin/audit" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
        <Route path="/admin/team" element={<ProtectedRoute><TeamManagement /></ProtectedRoute>} />
        <Route path="/admin/invites" element={<ProtectedRoute><Invites /></ProtectedRoute>} />
        
        {/* Employee Routes */}
        <Route path="/employee/dashboard" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="/employee/tasks" element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />
        <Route path="/employee/organizations" element={<ProtectedRoute><Organizations /></ProtectedRoute>} />
        <Route path="/employee/invites" element={<ProtectedRoute><Invites /></ProtectedRoute>} />
      </Routes>
    </Router>
  )
}

export default App
