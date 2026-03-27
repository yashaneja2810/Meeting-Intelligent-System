import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'

export default function LandingPage() {
  const navigate = useNavigate()
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])

  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      size: 'large',
      title: 'AI Multi-Agent System.',
      subtitle: 'Analyzes meetings with uncompromised precision.',
      image: 'gradient-1',
      colSpan: 'md:col-span-2'
    },
    {
      size: 'small',
      title: 'Smart Assignment.',
      subtitle: 'Based on skills & workload.',
      image: 'gradient-2',
      colSpan: 'col-span-1'
    },
    {
      size: 'small',
      title: 'Real-time Analytics.',
      subtitle: 'Beautiful tracking dashboards.',
      image: 'gradient-3',
      colSpan: 'col-span-1'
    },
    {
      size: 'large',
      title: 'Total Transparency.',
      subtitle: 'Detailed audit logs for every AI decision made.',
      image: 'gradient-4',
      colSpan: 'md:col-span-2'
    }
  ]

  return (
    <div className="min-h-screen bg-apple-gray text-apple-dark font-sans selection:bg-black selection:text-white">
      {/* Sleek Minimal Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/70 backdrop-blur-xl border-b border-gray-200/50' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-black">AutoExec</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/login')} className="text-sm font-medium text-gray-500 hover:text-black transition-colors hidden sm:block">
              Sign In
            </button>
            <button onClick={() => navigate('/signup')} className="bg-black text-white text-sm px-5 py-2 rounded-full font-medium hover:bg-gray-800 transition-colors shadow-sm active:scale-95">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-40 pb-20 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto z-10"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block mb-6"
          >
            <span className="border border-gray-200 bg-white/50 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide text-gray-600 shadow-sm">
              Introducing AutoExec AI Agent
            </span>
          </motion.div>

          <h1 className="text-hero mb-6 leading-tight">
            Meetings converted to <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500">actions instantly.</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-500 mb-10 max-w-2xl mx-auto font-medium tracking-tight">
            The intelligent system that listens, extracts, assigns, and tracks tasks with uncompromised precision.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button onClick={() => navigate('/signup')} className="btn-primary w-full sm:w-auto text-lg px-8 py-4">
              Start Free Trial
            </button>
            <button className="btn-secondary w-full sm:w-auto text-lg px-8 py-4 flex items-center justify-center gap-2">
              Watch Demo
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Hero Visual Container */}
        <motion.div
          style={{ y }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
          className="mt-20 w-full max-w-6xl mx-auto relative z-0 perspective-1000"
        >
          {/* Subtle glow behind the dashboard */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-500/20 blur-[120px] rounded-full -z-10"></div>

          <div className="rounded-2xl md:rounded-[40px] border border-gray-200/50 bg-white/40 backdrop-blur-3xl p-2 shadow-2xl overflow-hidden">
            <div className="bg-white rounded-xl md:rounded-[32px] overflow-hidden border border-gray-100 shadow-inner relative aspect-[16/9] flex items-center justify-center">
              {/* Mock Dashboard UI inside the hero visual */}
              <div className="absolute inset-0 bg-gray-50/50 p-6 md:p-10 flex flex-col">
                {/* Header mock */}
                <div className="flex justify-between items-center mb-8">
                  <div className="w-48 h-8 bg-gray-200 rounded-md"></div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
                {/* Grid mock */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-32 flex flex-col justify-end">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl mb-4 self-start"></div>
                      <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
                {/* List mock */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="w-1/4 h-6 bg-gray-200 rounded mb-6"></div>
                  {[1, 2].map(i => (
                    <div key={i} className="w-full h-12 bg-gray-50 rounded-lg mb-3"></div>
                  ))}
                </div>
              </div>

              {/* Central Floating Element to show AI doing work */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 w-24 h-24 bg-black rounded-2xl shadow-2xl shadow-black/20 flex items-center justify-center"
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {/* Ping rings */}
                <div className="absolute inset-0 rounded-2xl border-2 border-black/20 animate-ping"></div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bento Box Features Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black mb-4">Brilliant by design.</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">Everything you need to automate your entire meeting workflow seamlessly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`${feature.colSpan} border border-gray-100 bg-gray-50 rounded-3xl p-8 hover:shadow-apple-hover transition-all duration-500 overflow-hidden relative group`}
              >
                <div className="relative z-10 h-full flex flex-col justify-end">
                  <h3 className="text-2xl md:text-3xl font-bold text-black mb-2">{feature.title}</h3>
                  <p className="text-gray-500 text-lg font-medium">{feature.subtitle}</p>
                </div>
                {/* Decorative background representing the feature */}
                <div className={`absolute top-0 right-0 w-full h-full opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br from-black to-transparent`}></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-black mb-16">Three steps.<br />Total completion.</h2>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { num: '1', title: 'Upload', desc: 'Drop your transcript into our secure processor.' },
              { num: '2', title: 'Analyze', desc: 'Our Multi-Agent system extracts action items.' },
              { num: '3', title: 'Execute', desc: 'Tasks are assigned and tracked automatically.' }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 bg-white shadow-apple rounded-full flex items-center justify-center text-2xl font-bold text-black mb-6">
                  {step.num}
                </div>
                <h3 className="text-2xl font-bold text-black mb-3">{step.title}</h3>
                <p className="text-gray-500 font-medium">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-black text-white rounded-t-[3rem] mt-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white">Ready to automate?</h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">Join the teams using AI to execute faster and smarter. No credit card required.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/signup')} className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform">
              Get Started for Free
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
