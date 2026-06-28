import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// SVG Icons
const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="1" width="6" height="11" rx="3" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const MicOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.13 1.49-.35 2.17" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const VideoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const VideoOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const ScreenShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    <polyline points="8 11 12 7 16 11" /><line x1="12" y1="7" x2="12" y2="15" />
  </svg>
);

const ScreenShareStopIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    <line x1="9" y1="8" x2="15" y2="14" /><line x1="15" y1="8" x2="9" y2="14" />
  </svg>
);

const HandIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-4 0v1M14 10V4a2 2 0 0 0-4 0v6M10 10.5V5a2 2 0 0 0-4 0v9" />
    <path d="M18 11a2 2 0 0 1 4 0v3a8 8 0 0 1-8 8h-2c-2.76 0-5.26-1.12-7.07-2.93L2 16" />
  </svg>
);

const SmileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

const PhoneOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
    <line x1="23" y1="1" x2="1" y2="23" />
  </svg>
);

const CaptionsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><path d="M7 12h2m4 0h4M7 16h10" />
  </svg>
);

const LayoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

// Layout Icons
const GridViewIcon = ({ active }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'currentColor' : 'var(--text-tertiary)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
const SpeakerViewIcon = ({ active }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'currentColor' : 'var(--text-tertiary)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="13" rx="2" /><rect x="4" y="18" width="4" height="4" rx="1" /><rect x="10" y="18" width="4" height="4" rx="1" /><rect x="16" y="18" width="4" height="4" rx="1" /></svg>;
const SidebarViewIcon = ({ active }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'currentColor' : 'var(--text-tertiary)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="14" height="20" rx="2" /><rect x="18" y="2" width="4" height="6" rx="1" /><rect x="18" y="10" width="4" height="6" rx="1" /><rect x="18" y="18" width="4" height="4" rx="1" /></svg>;

const LAYOUT_OPTIONS = [
  { key: 'grid', label: 'Grid View', Icon: GridViewIcon, desc: 'Equal tiles for everyone' },
  { key: 'speaker', label: 'Speaker View', Icon: SpeakerViewIcon, desc: 'One large, rest in strip' },
  { key: 'sidebar', label: 'Sidebar View', Icon: SidebarViewIcon, desc: 'Main + side stack' }
];

const REACTION_EMOJIS = ['👍', '👏', '❤️', '😂', '🎉', '🤔', '😮', '🔥'];

export default function ControlBar({
  isMuted,
  isVideoOn,
  isScreenSharing,
  isHandRaised,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onToggleHandRaise,
  onLeaveMeeting,
  showSidebar,
  onToggleSidebar,
  onReaction,
  onToggleCaptions,
  showCaptions,
  meetingDuration,
  layoutMode = 'grid',
  onChangeLayout
}) {
  const [showReactions, setShowReactions] = useState(false);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  
  const reactionsRef = useRef(null);
  const layoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (reactionsRef.current && !reactionsRef.current.contains(e.target)) setShowReactions(false);
      if (layoutRef.current && !layoutRef.current.contains(e.target)) setShowLayoutPicker(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getControlButtonStyles = (isActive, isDanger = false) => {
    if (isDanger) return { background: 'var(--danger)', color: '#fff', border: '1px solid var(--danger)' };
    if (!isActive) return { background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)' };
    return { background: '#fff', color: '#000', border: '1px solid #fff' };
  };

  return (
    <div style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border-default)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 50 }}>
      
      {/* Left: Time */}
      <div style={{ width: 150, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', background: 'var(--bg-elevated)', padding: '6px 12px', borderRadius: 100, border: '1px solid var(--border-default)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 8px var(--danger)' }} className="pulse-ring" />
          {formatTime(meetingDuration)}
        </div>
      </div>

      {/* Center: Core Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={onToggleMute}
          style={{ ...getControlButtonStyles(!isMuted), width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', cursor: 'pointer' }}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOffIcon /> : <MicIcon />}
        </button>

        <button
          onClick={onToggleVideo}
          style={{ ...getControlButtonStyles(isVideoOn), width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', cursor: 'pointer' }}
          title={isVideoOn ? "Stop Video" : "Start Video"}
        >
          {isVideoOn ? <VideoIcon /> : <VideoOffIcon />}
        </button>

        <button
          onClick={onToggleScreenShare}
          style={{ ...getControlButtonStyles(isScreenSharing), width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', cursor: 'pointer' }}
          title={isScreenSharing ? "Stop sharing" : "Share screen"}
        >
          {isScreenSharing ? <ScreenShareStopIcon /> : <ScreenShareIcon />}
        </button>

        <button
          onClick={onToggleHandRaise}
          style={{ ...getControlButtonStyles(isHandRaised), width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', cursor: 'pointer' }}
          title={isHandRaised ? "Lower hand" : "Raise hand"}
        >
          <HandIcon />
        </button>

        {/* Reactions Picker */}
        <div style={{ position: 'relative' }} ref={reactionsRef}>
          <button
            onClick={() => setShowReactions(!showReactions)}
            style={{ ...getControlButtonStyles(showReactions), width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', cursor: 'pointer' }}
            title="Reactions"
          >
            <SmileIcon />
          </button>
          
          <AnimatePresence>
            {showReactions && (
              <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 16, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 100, padding: '8px 12px', display: 'flex', gap: 4, boxShadow: 'var(--shadow-lg)' }}>
                {REACTION_EMOJIS.map(emoji => (
                  <button
                    key={emoji} onClick={() => { onReaction(emoji); setShowReactions(false); }}
                    style={{ fontSize: 24, padding: '8px 12px', borderRadius: 100, background: 'transparent', border: 'none', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.3) translateY(-4px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Layout Picker */}
        <div style={{ position: 'relative' }} ref={layoutRef}>
          <button
            onClick={() => setShowLayoutPicker(!showLayoutPicker)}
            style={{ ...getControlButtonStyles(showLayoutPicker), width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', cursor: 'pointer' }}
            title="Change Layout"
          >
            <LayoutIcon />
          </button>
          
          <AnimatePresence>
            {showLayoutPicker && (
              <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 16, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 16, padding: 8, width: 220, boxShadow: 'var(--shadow-lg)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px 12px' }}>Layout</p>
                {LAYOUT_OPTIONS.map(opt => (
                  <button
                    key={opt.key} onClick={() => { onChangeLayout(opt.key); setShowLayoutPicker(false); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 10, background: layoutMode === opt.key ? 'var(--bg-overlay)' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s' }}
                  >
                    <div style={{ color: layoutMode === opt.key ? 'var(--info)' : 'var(--text-primary)' }}><opt.Icon active={layoutMode === opt.key} /></div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: layoutMode === opt.key ? 'var(--info)' : 'var(--text-primary)' }}>{opt.label}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{opt.desc}</p>
                    </div>
                    {layoutMode === opt.key && <span style={{ marginLeft: 'auto', color: 'var(--info)' }}>✓</span>}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={onLeaveMeeting}
          style={{ ...getControlButtonStyles(false, true), width: 72, height: 56, borderRadius: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', cursor: 'pointer', marginLeft: 16 }}
          title="Leave Meeting"
        >
          <PhoneOffIcon />
        </button>
      </div>

      {/* Right: Sidebar / Captions */}
      <div style={{ width: 150, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
        <button
          onClick={onToggleCaptions}
          style={{ padding: 12, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', cursor: 'pointer', border: 'none', background: showCaptions ? 'rgba(255,255,255,0.1)' : 'transparent', color: showCaptions ? '#fff' : 'var(--text-secondary)' }}
          title={showCaptions ? "Hide Captions" : "Show Captions"}
        >
          <CaptionsIcon />
        </button>
        <button
          onClick={onToggleSidebar}
          style={{ padding: '10px 16px', borderRadius: 100, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', cursor: 'pointer', border: '1px solid var(--border-default)', background: showSidebar ? 'var(--bg-elevated)' : 'var(--bg-overlay)', color: showSidebar ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          title="Toggle Sidebar"
        >
          <span style={{ fontSize: 13, fontWeight: 700 }}>Chat</span>
          {showSidebar ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="15" y1="3" x2="15" y2="21" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /></svg>
          )}
        </button>
      </div>
    </div>
  );
}
