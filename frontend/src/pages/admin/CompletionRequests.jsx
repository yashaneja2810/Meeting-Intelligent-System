import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import DashboardLayout from '@/components/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'

export default function CompletionRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [reviewingId, setReviewingId] = useState(null)
  const [reviewModal, setReviewModal] = useState(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadRequests()
  }, [filter])

  const loadRequests = async () => {
    try {
      const params = filter ? `?status=${filter}` : ''
      const data = await api.get(`/completion-requests${params}`)
      setRequests(data)
    } catch (err) {
      console.error('Load requests error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = (request, action) => {
    setReviewModal({ request, action })
    setReviewNotes('')
  }

  const submitReview = async () => {
    if (!reviewModal) return
    
    setSubmitting(true)
    try {
      await api.put(`/completion-requests/${reviewModal.request.id}`, {
        status: reviewModal.action,
        reviewNotes
      })
      
      setRequests(requests.filter(r => r.id !== reviewModal.request.id))
      setReviewModal(null)
      setReviewNotes('')
    } catch (err) {
      console.error('Review error:', err)
      alert('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50 text-red-600 border-red-200'
      case 'high': return 'bg-orange-50 text-orange-600 border-orange-200'
      case 'medium': return 'bg-gray-50 text-gray-600 border-gray-200'
      case 'low': return 'bg-gray-50 text-gray-500 border-gray-200'
      default: return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-[3px] border-gray-100 border-t-black rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-headline mb-2">Completion Requests</h1>
            <p className="text-gray-500 font-medium tracking-tight">Review and approve task completions from your team.</p>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field bg-white shadow-sm border-gray-200 py-3 pr-10 w-full md:w-64 cursor-pointer hover:bg-gray-50/50 transition-colors"
          >
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="">All Requests</option>
          </select>
        </div>

        {requests.length === 0 ? (
          <div className="surface flex flex-col items-center justify-center p-20 text-center border-transparent shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-[28px] flex items-center justify-center mb-6 border border-gray-100">
              <span className="text-4xl">✅</span>
            </div>
            <p className="text-2xl font-bold text-black tracking-tight mb-2">
              {filter === 'pending' ? 'No pending requests' : 'No requests found'}
            </p>
            <p className="text-gray-500 font-medium">
              {filter === 'pending' 
                ? 'Completion requests will appear here when team members submit them.' 
                : 'Try changing the filter to see other requests.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {requests.map((request, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  key={request.id}
                  className="surface p-6 md:p-8 border-transparent hover:shadow-apple-hover transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Task Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 shrink-0 bg-blue-50 rounded-[18px] flex items-center justify-center text-2xl border border-blue-100">
                          ✅
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-xl text-black tracking-tight mb-2">{request.task.title}</h3>
                          <p className="text-gray-600 text-sm mb-3 leading-relaxed">{request.task.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getPriorityColor(request.task.priority)}`}>
                              {request.task.priority.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500 font-medium">
                              Requested by: <strong className="text-black">{request.requested_by_member.name}</strong>
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span className="text-[13px] font-medium text-gray-400">
                              {new Date(request.created_at).toLocaleString(undefined, {
                                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                              })}
                            </span>
                          </div>

                          {request.completion_notes && (
                            <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                              <h4 className="text-[11px] font-bold text-black uppercase tracking-wider mb-2">📝 Completion Notes</h4>
                              <p className="text-sm text-gray-600 leading-relaxed font-medium">{request.completion_notes}</p>
                            </div>
                          )}

                          {request.status !== 'pending' && (
                            <div className={`mt-4 p-4 rounded-xl border ${
                              request.status === 'approved' 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-red-50 border-red-200'
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{request.status === 'approved' ? '✅' : '❌'}</span>
                                <span className="font-bold text-sm">
                                  {request.status === 'approved' ? 'Approved' : 'Rejected'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  • {new Date(request.reviewed_at).toLocaleDateString()}
                                </span>
                              </div>
                              {request.review_notes && (
                                <p className="text-sm text-gray-600 mt-2">{request.review_notes}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {request.status === 'pending' && (
                      <div className="flex lg:flex-col gap-3 lg:w-48">
                        <button
                          onClick={() => handleReview(request, 'approved')}
                          disabled={reviewingId === request.id}
                          className="flex-1 lg:flex-none px-6 py-3.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleReview(request, 'rejected')}
                          disabled={reviewingId === request.id}
                          className="flex-1 lg:flex-none px-6 py-3.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !submitting && setReviewModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="surface max-w-lg w-full p-8 border-transparent shadow-2xl"
            >
              <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center mb-6 border ${
                reviewModal.action === 'approved'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <span className="text-3xl">{reviewModal.action === 'approved' ? '✅' : '❌'}</span>
              </div>
              
              <h3 className="text-2xl font-bold text-black mb-3 tracking-tight">
                {reviewModal.action === 'approved' ? 'Approve Task' : 'Reject Task'}
              </h3>
              <p className="text-gray-500 font-medium mb-2">
                <strong>{reviewModal.request.task.title}</strong>
              </p>
              <p className="text-gray-500 font-medium mb-6">
                Requested by: {reviewModal.request.requested_by_member.name}
              </p>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {reviewModal.action === 'approved' ? 'Approval Notes (Optional)' : 'Rejection Reason'}
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={reviewModal.action === 'approved' 
                    ? 'Add any feedback or comments...' 
                    : 'Explain what needs to be fixed...'}
                  className="input-field min-h-[120px] resize-none"
                  disabled={submitting}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setReviewModal(null)}
                  disabled={submitting}
                  className="flex-1 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  disabled={submitting || (reviewModal.action === 'rejected' && !reviewNotes.trim())}
                  className={`flex-1 px-6 py-3.5 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                    reviewModal.action === 'approved'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    `Confirm ${reviewModal.action === 'approved' ? 'Approval' : 'Rejection'}`
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
