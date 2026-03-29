import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function LandingPage() {
  const navigate = useNavigate()
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])

  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      size: 'large',
      title: 'AI Action Extraction.',
      subtitle: 'Identify tasks, deadlines, and owners with uncompromised precision.',
      color: 'from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20',
      iconColor: 'bg-blue-50/50 text-blue-600 border border-blue-100',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
      ),
      colSpan: 'md:col-span-2'
    },
    {
      size: 'small',
      title: 'Smart Assignment.',
      subtitle: 'Assigns tasks based on workload.',
      color: 'from-purple-500/10 to-fuchsia-500/10 hover:from-purple-500/20 hover:to-fuchsia-500/20',
      iconColor: 'bg-purple-50/50 text-purple-600 border border-purple-100',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
      ),
      colSpan: 'col-span-1 border-l sm:border-t sm:border-l-0 md:border-t-0 md:border-l'
    },
    {
      size: 'small',
      title: 'Real-time Analytics.',
      subtitle: 'Beautiful tracking dashboards.',
      color: 'from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20',
      iconColor: 'bg-emerald-50/50 text-emerald-600 border border-emerald-100',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      ),
      colSpan: 'col-span-1 border-t md:border-l md:border-t'
    },
    {
      size: 'large',
      title: 'Immutable Auditing.',
      subtitle: 'Detailed, immutable logs for total transparency.',
      color: 'from-rose-500/10 to-orange-500/10 hover:from-rose-500/20 hover:to-orange-500/20',
      iconColor: 'bg-rose-50/50 text-rose-600 border border-rose-100',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
      ),
      colSpan: 'md:col-span-2 border-t md:border-t md:border-l'
    }
  ]

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 font-sans selection:bg-indigo-500/30 selection:text-indigo-900 relative overflow-x-hidden">
      
      {/* Background Ambient Mesh & Grid - Ultra refined */}
      <div className="absolute top-0 inset-x-0 h-[100vh] overflow-hidden -z-10 pointer-events-none">
        {/* Subtle grid pattern fading gently into the background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDAuNWg0ME0wIDQwLjVoNDBNMC41IDB2NDBNNDAuNSAwdjQwIiBzdHJva2U9IiNhYWFhYWEiIHN0cm9rZS1vcGFjaXR5PSIwLjA2Ii8+PC9zdmc+')] [mask-image:linear-gradient(to_bottom,white,transparent_80%)]"></div>
        
        {/* Extremely soft, slow-moving ambient glows */}
        <div className="absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-indigo-400/20 blur-[120px] mix-blend-multiply opacity-70 animate-blob"></div>
        <div className="absolute top-[5%] right-[20%] w-[35vw] h-[35vw] rounded-full bg-purple-400/20 blur-[130px] mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-[15%] left-[40%] w-[50vw] h-[50vw] rounded-full bg-blue-300/20 blur-[140px] mix-blend-multiply opacity-50 animate-blob animation-delay-4000"></div>
        
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")', opacity: 0.15 }}></div>
      </div>

      {/* Sleek Minimal Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ease-out border-b ${isScrolled ? 'bg-white/80 backdrop-blur-xl border-gray-200/50 shadow-sm py-3' : 'bg-transparent border-transparent py-5'}`}>
        <div className="w-full max-w-[1600px] px-6 md:px-12 mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.12)] border border-gray-700 group-hover:bg-gray-800 transition-colors duration-300">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-gray-700 transition-colors">AutoExec</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/login')} className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
              Log in
            </button>
            <button onClick={() => navigate('/signup')} className="relative group overflow-hidden bg-gray-900 text-white text-sm px-5 py-2 rounded-full font-semibold transition-all shadow-[0_2px_12px_max(0px,rgba(0,0,0,0.15))] hover:shadow-[0_4px_16px_max(0px,rgba(0,0,0,0.2))] active:scale-95 border border-gray-700/50 hover:border-gray-600">
              <span className="relative z-10">Get Started</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-44 pb-20 px-6 md:px-12 flex flex-col items-center justify-center min-h-[95vh]">
        <motion.div
          style={{ opacity }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center w-full max-w-5xl mx-auto z-10"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block mb-8"
          >
            <span className="group inline-flex items-center gap-2 border border-black/5 bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-full text-[13px] font-semibold tracking-wide text-gray-600 shadow-sm cursor-pointer hover:bg-white transition-colors">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400/60 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              AutoExec AI Agent Available Now
            </span>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[6.5rem] font-extrabold tracking-tighter mb-6 text-gray-900 leading-[0.95]">
            Meetings converted<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">
              to actions instantly.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-2xl mx-auto font-medium tracking-tight leading-relaxed">
            The intelligent orchestrator that parses context, extracts tasks, assigns ownership, and tracks progress with uncompromised precision.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button onClick={() => navigate('/signup')} className="relative group bg-gray-900 text-white w-full sm:w-auto text-[15px] font-semibold px-8 py-3.5 rounded-full overflow-hidden shadow-[0_4px_14px_0_rgb(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:bg-gray-800 active:scale-95 transition-all">
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start Free Trial
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </span>
            </button>
            <button className="group bg-white border border-gray-200 text-gray-700 w-full sm:w-auto text-[15px] font-semibold px-8 py-3.5 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:scale-95 flex items-center justify-center gap-2">
              Book a Demo
            </button>
          </div>
        </motion.div>

        {/* Hero Visual - Premium Mockup */}
        <motion.div
          style={{ y: heroY }}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[1240px] mx-auto relative z-20"
        >
          {/* Subtle outer glow for depth */}
          <div className="absolute inset-0 bg-blue-500/5 blur-[80px] -z-10 rounded-full scale-90"></div>
          
          <div className="rounded-[2rem] border border-gray-200/60 bg-white/40 backdrop-blur-3xl p-2 md:p-3 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] ring-1 ring-black/5">
            <div className="bg-[#fcfcfc] rounded-[1.5rem] md:rounded-[1.75rem] overflow-hidden border border-gray-100 shadow-sm relative h-[400px] md:h-[600px] w-full flex flex-col">
               
               {/* Browser/App Header */}
               <div className="h-14 border-b border-gray-100/80 flex items-center px-6 justify-between bg-white relative">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500/20"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500/20"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500/20"></div>
                    </div>
                  </div>
                  {/* Fake URL bar */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-64 md:w-96 h-7 bg-gray-50 border border-gray-100 rounded-md flex items-center justify-center">
                    <div className="w-32 h-2 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100"></div>
                  </div>
               </div>

               {/* Dashboard Content Mock */}
               <div className="flex-1 flex bg-white relative overflow-hidden">
                  {/* Left Sidebar */}
                  <div className="hidden md:flex flex-col w-56 border-r border-gray-100/80 p-4 gap-2 bg-[#fcfcfc]">
                    <div className="w-24 h-4 bg-gray-200 rounded-full mb-4 ml-2"></div>
                    <div className="h-9 w-full bg-indigo-50/50 rounded-lg border border-indigo-100/50 flex items-center px-3">
                       <div className="w-4 h-4 rounded bg-indigo-200 mr-3"></div>
                       <div className="w-16 h-2 bg-indigo-600/40 rounded-full"></div>
                    </div>
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-9 w-full rounded-lg flex items-center px-3 hover:bg-gray-50">
                        <div className="w-4 h-4 rounded bg-gray-200 mr-3"></div>
                        <div className="w-20 h-2 bg-gray-200 rounded-full"></div>
                      </div>
                    ))}
                  </div>

                  {/* Main Area */}
                  <div className="flex-1 p-6 md:p-10 flex flex-col gap-8 bg-white relative">
                    <div className="w-48 h-6 bg-gray-900 rounded-full opacity-10 mb-2"></div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {[1,2,3].map(i => (
                         <div key={i} className="h-28 rounded-2xl border border-gray-100 bg-white shadow-sm p-4 flex flex-col justify-between">
                            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100"></div>
                            <div className="w-16 h-5 bg-gray-100 rounded-full"></div>
                         </div>
                       ))}
                       <div className="h-28 rounded-2xl bg-gray-900 shadow-md p-4 flex flex-col justify-between relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-xl rounded-full"></div>
                         <div className="w-8 h-8 rounded-full bg-white/20"></div>
                         <div className="w-20 h-5 bg-white/80 rounded-full"></div>
                       </div>
                    </div>

                    <div className="flex-1 border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                      <div className="h-14 border-b border-gray-100 bg-gray-50/50 flex items-center px-6">
                        <div className="w-32 h-3 bg-gray-200 rounded-full"></div>
                      </div>
                      <div className="flex-1 p-6 flex flex-col gap-4 bg-white">
                        {[1,2].map(i => (
                          <div key={i} className="h-16 rounded-xl border border-gray-50 bg-gray-50/30 flex items-center px-4 justify-between">
                             <div className="flex items-center gap-4">
                               <div className="w-4 h-4 rounded bg-gray-200"></div>
                               <div className="flex flex-col gap-2">
                                 <div className="w-32 h-3 bg-gray-300 rounded-full"></div>
                                 <div className="w-20 h-2 bg-gray-200 rounded-full"></div>
                               </div>
                             </div>
                             <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* The AI overlay - highly polished */}
                  <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[1px] pointer-events-none">
                     <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, y: [-5, 5, -5] }}
                        transition={{ 
                          scale: { duration: 0.8, ease: "easeOut" },
                          opacity: { duration: 0.8 },
                          y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="relative"
                     >
                       <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ring-1 ring-black/5 flex items-center justify-center relative overflow-hidden">
                          {/* Inner soft gradient */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 to-purple-50 opacity-50"></div>
                          
                          <svg className="w-12 h-12 md:w-16 md:h-16 text-indigo-600 relative z-10 filter drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>

                          {/* Orbit rings */}
                          <div className="absolute inset-0 rounded-[2rem] border border-indigo-100/50 animate-[spin_10s_linear_infinite]"></div>
                          <div className="absolute inset-[-10px] rounded-[2.5rem] border border-purple-100/30 animate-[spin_15s_linear_infinite_reverse]"></div>
                       </div>
                       
                       {/* Connection dots pointing outwards */}
                       <div className="absolute top-1/2 -left-6 w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></div>
                       <div className="absolute top-1/2 -right-6 w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" style={{ animationDelay: '500ms'}}></div>
                       <div className="absolute -top-6 left-1/2 w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" style={{ animationDelay: '1000ms'}}></div>
                     </motion.div>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bento Grid - Structured and Clean */}
      <section className="py-32 px-6 md:px-12 w-full max-w-[1400px] mx-auto relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 w-full text-center">Engineered for clarity.</h2>
          <p className="text-lg md:text-xl text-gray-500 tracking-tight font-medium max-w-2xl mx-auto">Skip the noise. Our unified platform transforms scattered conversations into structured, trackable execution.</p>
        </div>

        {/* Refined clean table-like grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-gray-200/60 rounded-3xl overflow-hidden bg-white shadow-sm ring-1 ring-black/5">
          {features.map((feature, idx) => (
            <div key={idx} className={`${feature.colSpan} relative group p-10 md:p-12 hover:bg-gray-50/50 transition-colors duration-300`}>
              {/* Bottom/Right borders simulating a grid line */}
              <div className="absolute inset-x-0 bottom-0 border-b border-gray-200/60 pointer-events-none"></div>
              <div className="absolute inset-y-0 right-0 border-r border-gray-200/60 pointer-events-none"></div>

              <div className="relative z-10 h-full flex flex-col justify-start">
                <div className={`w-14 h-14 rounded-xl ${feature.iconColor} flex items-center justify-center mb-8`}>
                   {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-gray-500 text-[15px] font-medium leading-relaxed max-w-md">{feature.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section - Thin Minimalist Circles */}
      <section className="py-32 px-6 md:px-12 bg-white relative z-10 border-t border-gray-200/50">
        <div className="w-full max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-20 leading-tight">Flow without friction.</h2>

          <div className="grid md:grid-cols-3 gap-12 text-center relative">
            {/* Minimal Connecting line */}
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-[1px] bg-gray-200 z-0"></div>

            {[
              { num: '1', title: 'Connect', desc: 'Sync your calendar or upload directly.' },
              { num: '2', title: 'Synthesize', desc: 'Agents parse insights into actionable steps.' },
              { num: '3', title: 'Execute', desc: 'Auto-assigned to your team seamlessly.' }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center relative z-10"
              >
                <div className="w-20 h-20 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-6 shadow-sm group cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all">
                   <span className="text-gray-400 group-hover:text-indigo-600 text-lg font-semibold font-mono tracking-tighter transition-colors">0{step.num}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 font-medium text-[15px] leading-relaxed max-w-[200px]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Refined Final CTA */}
      <section className="py-32 px-6 md:px-12 bg-[#FDFDFD] relative z-10 border-t border-gray-200/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-gray-900 leading-tight">Start building <br className="hidden md:block" />your AI workforce.</h2>
          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto font-medium">Join forward-thinking teams using AutoExec to drive immense productivity.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/signup')} className="bg-gray-900 text-white px-8 py-3.5 rounded-full font-semibold text-[15px] shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:bg-gray-800 active:scale-95 transition-all">
              Sign Up for Free
            </button>
            <button className="bg-white border border-gray-200 text-gray-700 font-semibold px-8 py-3.5 rounded-full hover:bg-gray-50 transition-colors shadow-sm active:scale-95">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}