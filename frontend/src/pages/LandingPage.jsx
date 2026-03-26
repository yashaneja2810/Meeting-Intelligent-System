import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'AI-Powered Intelligence',
      description: 'Multi-agent system analyzes meetings and assigns tasks with explainable reasoning'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Smart Assignment',
      description: 'Automatic task distribution based on skills, roles, and workload balancing'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Complete Transparency',
      description: 'Detailed audit logs show every AI decision with confidence scores'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Intelligent Tracking',
      description: 'Automatic reminders, deadline monitoring, and smart escalations'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Team Collaboration',
      description: 'Seamless Slack and email integration for instant notifications'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Real-time Updates',
      description: 'Beautiful dashboard with live task tracking and team progress'
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Subtle Static Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-black opacity-[0.02] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-black opacity-[0.02] rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0">
        <div className="frosted-glass m-4 rounded-2xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-black">AutoExec AI</span>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => navigate('/login')} 
                className="px-6 py-2.5 text-gray-700 hover:text-black font-medium rounded-xl hover:bg-white/50 transition-all"
              >
                Login
              </button>
              <button onClick={() => navigate('/signup')} className="btn-primary">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-8"
            >
              <div className="frosted-glass px-6 py-3 rounded-full inline-flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 bg-black rounded-full animate-pulse"></span>
                <span className="text-sm font-semibold text-gray-700">AI-Powered Meeting Automation</span>
              </div>
            </motion.div>
            
            <h1 className="text-7xl font-bold mb-6 leading-tight text-black">
              Turn Meetings Into
              <br />
              <span className="relative inline-block">
                Actionable Results
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="absolute bottom-2 left-0 h-3 bg-black opacity-10 -z-10"
                />
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Intelligent system that converts meeting transcripts into structured tasks,
              automatically assigns them to team members, and tracks execution with AI precision.
            </p>
            
            <div className="flex gap-4 justify-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/signup')} 
                className="btn-primary text-lg px-10 py-4"
              >
                Start Free Trial
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary text-lg px-10 py-4"
              >
                Watch Demo
              </motion.button>
            </div>
          </motion.div>

          {/* Hero Visual - Glassmorphic Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative max-w-6xl mx-auto"
          >
            <div className="liquid-glass p-8 shadow-2xl">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 flex items-center justify-center relative overflow-hidden">
                {/* Simulated Dashboard */}
                <div className="absolute inset-0 p-8">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="frosted-glass p-4 rounded-lg">
                        <div className="h-2 w-20 bg-gray-300 rounded mb-2"></div>
                        <div className="h-8 w-16 bg-black rounded"></div>
                      </div>
                    ))}
                  </div>
                  <div className="frosted-glass p-6 rounded-lg">
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
                            <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Floating Icon */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center shadow-2xl"
                  >
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4 text-black">
              Intelligent Automation
            </h2>
            <p className="text-xl text-gray-600">Powered by advanced AI agents</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="liquid-glass p-8 group cursor-pointer"
              >
                <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-black">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4 text-black">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">Three simple steps to automation</p>
          </motion.div>

          <div className="space-y-6">
            {[
              { step: '01', title: 'Upload Transcript', description: 'Paste or upload your meeting transcript in seconds' },
              { step: '02', title: 'AI Processing', description: 'Multi-agent system analyzes and extracts actionable tasks' },
              { step: '03', title: 'Auto Execution', description: 'Tasks assigned, tracked, and executed with smart automation' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="liquid-glass p-8 flex items-center gap-8 cursor-pointer"
              >
                <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-lg">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2 text-black">{item.title}</h3>
                  <p className="text-gray-600 text-lg">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="liquid-glass p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4 text-black">Ready to Transform Your Meetings?</h2>
              <p className="text-xl text-gray-600 mb-8">Join teams using AI to execute faster and smarter</p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/signup')} 
                className="btn-primary text-lg px-12 py-4"
              >
                Get Started Now
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="frosted-glass p-8 rounded-2xl text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-black">AutoExec AI</span>
            </div>
            <p className="text-gray-600 mb-2">Intelligent Meeting-to-Execution System</p>
            <p className="text-gray-500 text-sm">© 2026 AutoExec AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
