import { motion, AnimatePresence } from 'framer-motion'

export default function AlertDialog({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  variant = 'info' // 'info', 'success', 'error'
}) {
  if (!isOpen) return null

  const variantStyles = {
    success: {
      icon: (
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-green-50 border-green-200'
    },
    error: {
      icon: (
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-red-50 border-red-200'
    },
    info: {
      icon: (
        <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-gray-50 border-gray-200'
    }
  }

  const style = variantStyles[variant]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white max-w-md w-full p-8 rounded-2xl shadow-2xl border border-gray-100"
        >
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border ${style.iconBg}`}>
            {style.icon}
          </div>
          
          <h3 className="text-2xl font-bold text-black mb-3 tracking-tight">
            {title}
          </h3>
          <p className="text-gray-600 font-medium mb-8 leading-relaxed">
            {message}
          </p>

          <button
            onClick={onClose}
            className="w-full px-6 py-3.5 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            OK
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
