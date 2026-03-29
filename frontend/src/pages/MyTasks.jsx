import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import DashboardLayout from '@/components/DashboardLayout'
import AlertDialog from '@/components/AlertDialog'
import { motion, AnimatePresence } from 'framer-motion'

export default function MyTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedTask, setSelectedTask] = useState(null)
  const [showCompletionModal, setShowCompletionModal] = useState(null)
  const [completionNotes, setCompletionNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [alertDialog, setAlertDialog] = useState(null)

  useEffect(() => {
    loadTasks()
  }, [filter])

  const loadTasks = async () => {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : ''
      const data = await api.get(`/my-tasks${params}`)
      setTasks(data)
    } catch (err) {
      console.error('Load tasks error:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.put(`/my-tasks/${taskId}/status`, { status })
      loadTasks()
      setSelectedTask(null)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleRequestCompletion = (task) => {
    setShowCompletionModal(task)
    setCompletionNotes('')
  }

  const submitCompletionRequest = async () => {
    if (!showCompletionModal) return

    setSubmitting(true)
    try {
      await api.post('/completion-requests', {
        taskId: showCompletionModal.id,
        completionNotes
      })

      setAlertDialog({
        title: 'Request Submitted',
        message: 'Completion request submitted! Your admin will review it.',
        variant: 'success'
      })
      setShowCompletionModal(null)
      setCompletionNotes('')
      loadTasks()
    } catch (err) {
      console.error('Submit completion request error:', err)
      setAlertDialog({
        title: 'Submit Failed',
        message: 'Failed to submit completion request. Please try again.',
        variant: 'error'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
      case 'high': return 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20'
      case 'medium': return 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20'
      case 'low': return 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/20'
      default: return 'bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-500/20'
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
      case 'in_progress': return 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
      case 'pending_review': return 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20'
      case 'blocked': return 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20'
      default: return 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/20'
    }
  }

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen w-full">
          <div className="w-8 h-8 border-[3px] border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto p-6 md:p-10 lg:p-14">

        {/* Header Section */}
        <div className="mb-14 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-3">My Tasks</h1>
          <p className="text-gray-500 text-lg font-medium tracking-tight">Your personalized action items.</p>
        </div>

        {/* High-End Bento Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-[20px] p-6 flex flex-col justify-between h-36 shadow-[0_2px_10px_rgba(0,0,0,0.02)] ring-1 ring-gray-200/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:ring-indigo-100 transition-all duration-300 cursor-pointer relative overflow-hidden group" onClick={() => setFilter('all')}>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-indigo-50/0 group-hover:from-indigo-50/50 group-hover:to-transparent transition-colors duration-500 pointer-events-none"></div>
            <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest relative z-10">Total Tasks</p>
            <p className="text-5xl font-black text-gray-900 tracking-tighter relative z-10 leading-none">{stats.total}</p>
          </div>
          <div className="bg-white rounded-[20px] p-6 flex flex-col justify-between h-36 shadow-[0_2px_10px_rgba(0,0,0,0.02)] ring-1 ring-gray-200/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:ring-amber-100 transition-all duration-300 cursor-pointer relative overflow-hidden group" onClick={() => setFilter('pending')}>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/0 to-amber-50/0 group-hover:from-amber-50/50 group-hover:to-transparent transition-colors duration-500 pointer-events-none"></div>
            <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest relative z-10">Pending</p>
            <p className="text-5xl font-black text-gray-400 tracking-tighter relative z-10 leading-none">{stats.pending}</p>
          </div>
          <div className="bg-gray-900 rounded-[20px] p-6 flex flex-col justify-between h-36 shadow-[0_4px_14px_0_rgb(0,0,0,0.15)] ring-1 ring-gray-800 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:ring-indigo-500/50 transition-all duration-300 cursor-pointer relative overflow-hidden group" onClick={() => setFilter('in_progress')}>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest relative z-10">In Progress</p>
            <p className="text-5xl font-black text-white tracking-tighter relative z-10 leading-none">{stats.inProgress}</p>
          </div>
          <div className="bg-white rounded-[20px] p-6 flex flex-col justify-between h-36 shadow-[0_2px_10px_rgba(0,0,0,0.02)] ring-1 ring-gray-200/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:ring-emerald-100 transition-all duration-300 cursor-pointer relative overflow-hidden group" onClick={() => setFilter('completed')}>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-emerald-50/0 group-hover:from-emerald-50/50 group-hover:to-transparent transition-colors duration-500 pointer-events-none"></div>
            <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest relative z-10">Completed</p>
            <p className="text-5xl font-black text-emerald-600 tracking-tighter relative z-10 leading-none">{stats.completed}</p>
          </div>
        </div>

        {/* Premium Native Segmented Control */}
        <div className="flex justify-center md:justify-start mb-10">
          <div className="flex bg-gray-100 p-1.5 rounded-2xl shadow-inner border border-gray-200/60 overflow-x-auto max-w-full custom-scrollbar">
            {['all', 'pending', 'in_progress', 'completed', 'blocked'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2.5 rounded-xl text-[13px] font-bold whitespace-nowrap transition-all duration-300 ${filter === status
                  ? 'bg-white text-gray-900 shadow-[0_1px_4px_rgba(0,0,0,0.1)] ring-1 ring-gray-200/50'
                  : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                {status === 'all' ? 'All Tasks' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks Grid */}
        {tasks.length === 0 ? (
          <div className="bg-[#FAFAFA] rounded-[2rem] flex flex-col items-center justify-center p-24 text-center border border-gray-100/50">
            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-8 shadow-sm border border-gray-100">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">
              {filter === 'all' ? 'All caught up!' : `No ${filter.replace('_', ' ')} tasks`}
            </p>
            <p className="text-gray-500 font-medium">You have no tasks matching this criteria.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <AnimatePresence>
              {tasks.map((task, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
                  key={task.id}
                  className="bg-white rounded-[1.5rem] p-8 flex flex-col shadow-[0_2px_12px_rgba(0,0,0,0.02)] ring-1 ring-gray-200/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:ring-indigo-100 transition-all duration-400 relative overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedTask(task)}
                >
                  {/* Subtle hover wash */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-5 gap-6">
                      <h3 className="text-xl font-bold text-gray-900 tracking-tight leading-snug group-hover:text-indigo-600 transition-colors">{task.title}</h3>
                      <div className="flex flex-col gap-2 shrink-0 items-end">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase ${getStatusBadge(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase ${getPriorityBadge(task.priority)}`}>
                          {task.priority} Priority
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-[15px] mb-6 leading-relaxed flex-1 line-clamp-3">{task.description}</p>

                    <div className="grid grid-cols-2 gap-4 bg-[#FAFAFA] p-5 rounded-2xl border border-gray-100 mb-6">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Deadline</p>
                        <p className="text-[14px] font-semibold text-gray-900">
                          {task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Source</p>
                        <p className="text-[14px] font-semibold text-gray-700 truncate">{task.meeting?.title || 'External'}</p>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-auto justify-end" onClick={(e) => e.stopPropagation()}>
                      {task.status === 'pending' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'in_progress')}
                          className="bg-gray-900 text-white text-[13px] font-bold px-6 py-3 rounded-full hover:bg-gray-800 shadow-sm transition-all hover:shadow-md"
                        >
                          Start Working
                        </button>
                      )}
                      {task.status === 'in_progress' && (
                        <>
                          <button
                            onClick={() => updateTaskStatus(task.id, 'blocked')}
                            className="bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-[13px] font-bold px-5 py-3 rounded-full transition-all shadow-sm"
                          >
                            Mark Blocked
                          </button>
                          <button
                            onClick={() => handleRequestCompletion(task)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-bold px-6 py-3 rounded-full transition-all shadow-sm hover:shadow-md"
                          >
                            Request Completion
                          </button>
                        </>
                      )}
                      {task.status === 'pending_review' && (
                        <div className="flex items-center gap-2 text-indigo-600 text-[13px] font-bold bg-indigo-50 px-5 py-3 rounded-full">
                          <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Pending Admin Review
                        </div>
                      )}
                      {task.status === 'blocked' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'in_progress')}
                          className="bg-gray-900 text-white text-[13px] font-bold px-6 py-3 rounded-full hover:bg-gray-800 shadow-sm transition-all hover:shadow-md"
                        >
                          Resume Task
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Deep Detail Modal Component */}
        <AnimatePresence>
          {selectedTask && (
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                className="bg-white p-8 md:p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl ring-1 ring-black/5 custom-scrollbar"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 bg-gray-50 rounded-[1.2rem] flex items-center justify-center border border-gray-100 shrink-0 shadow-sm">
                    <svg className="w-7 h-7 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-5 leading-tight">{selectedTask.title}</h2>

                <div className="flex flex-wrap gap-2 mb-10">
                  <span className={`px-3 py-1.5 rounded-md text-[11px] font-bold tracking-widest uppercase ${getPriorityBadge(selectedTask.priority)}`}>
                    {selectedTask.priority} Priority
                  </span>
                  <span className={`px-3 py-1.5 rounded-md text-[11px] font-bold tracking-widest uppercase ${getStatusBadge(selectedTask.status)}`}>
                    {selectedTask.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Description</h4>
                    <p className="text-[15px] font-medium text-gray-700 leading-relaxed bg-[#FAFAFA] p-6 rounded-2xl border border-gray-100/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">{selectedTask.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="bg-[#FAFAFA] p-5 rounded-2xl border border-gray-100">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Due Date</h4>
                      <p className="text-[15px] font-semibold text-gray-900">
                        {selectedTask.deadline ? new Date(selectedTask.deadline).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Not set'}
                      </p>
                    </div>
                    <div className="bg-[#FAFAFA] p-5 rounded-2xl border border-gray-100">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Source Context</h4>
                      <p className="text-[15px] font-semibold text-gray-900 mb-1 truncate">{selectedTask.meeting?.title || 'Unknown Source'}</p>
                      {selectedTask.meeting && (
                        <p className="text-[12px] text-gray-500 font-medium tracking-tight">
                          {new Date(selectedTask.meeting.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedTask.assignment_reason && (
                    <div className="border border-gray-200/80 rounded-[1.5rem] p-6 bg-white shadow-sm ring-1 ring-black/5">
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">AI Reasoning Model</h4>
                        {selectedTask.assignment_confidence && (
                          <span className="ml-auto bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-500/20 px-2.5 py-1 rounded-md text-[10px] font-bold">
                            {(selectedTask.assignment_confidence * 100).toFixed(0)}% Precise
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-[14px] leading-relaxed font-medium bg-[#F8F9FA] p-4 rounded-xl border border-gray-100 italic">"{selectedTask.assignment_reason}"</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Completion Request Form Details */}
        <AnimatePresence>
          {showCompletionModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
              onClick={() => !submitting && setShowCompletionModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white max-w-lg w-full p-8 md:p-10 rounded-[2rem] shadow-2xl ring-1 ring-black/5"
              >
                <div className="w-16 h-16 bg-emerald-50 rounded-[1.2rem] flex items-center justify-center mb-8 border border-emerald-100">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <h3 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">Request Completion</h3>
                <p className="text-gray-900 font-bold mb-2 text-[15px]">
                  {showCompletionModal.title}
                </p>
                <p className="text-gray-500 font-medium mb-8 text-[14px]">
                  Submit for admin review to formally mark this task as finished.
                </p>

                <div className="mb-8">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                    Completion Notes <span className="text-gray-300 normal-case">(Optional)</span>
                  </label>
                  <textarea
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="Describe what you've accomplished, PR links, or context..."
                    className="w-full bg-[#FAFAFA] border border-gray-200/80 rounded-2xl text-[14px] font-medium text-gray-900 px-5 py-4 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 hover:border-gray-300 transition-all shadow-sm min-h-[140px] resize-non custom-scrollbar"
                    disabled={submitting}
                  />
                  <p className="text-[12px] text-emerald-600 font-semibold mt-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Notes accelerate the review pipeline
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowCompletionModal(null)}
                    disabled={submitting}
                    className="flex-1 px-6 py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors border border-gray-200 shadow-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitCompletionRequest}
                    disabled={submitting}
                    className="flex-1 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center gap-2.5">
                        <div className="w-5 h-5 border-[3px] border-white/20 border-t-white rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      'Submit'
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AlertDialog
          isOpen={!!alertDialog}
          onClose={() => setAlertDialog(null)}
          title={alertDialog?.title}
          message={alertDialog?.message}
          variant={alertDialog?.variant}
        />
      </div>
    </DashboardLayout>
  )
}
