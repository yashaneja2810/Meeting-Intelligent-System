import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// SVG Icons
const MicIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="1" width="6" height="11" rx="3" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" />
  </svg>
);

const MicOffIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.13 1.49-.35 2.17" />
  </svg>
);

const VideoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const VideoOffIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const ScreenShareIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CrownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M2.5 16.5L5 7l4.5 5L12 4l2.5 8L19 7l2.5 9.5H2.5z" />
  </svg>
);

// Generate consistent gradient from name
const getAvatarGradient = (name) => {
  const gradients = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-600',
    'from-pink-500 to-rose-600',
    'from-indigo-500 to-blue-600',
  ];
  const hash = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
};

export default function ParticipantsPanel({ participants, currentUser, isHost }) {
  const [search, setSearch] = useState('');

  const allParticipants = [
    { ...currentUser, isLocal: true, status: 'joined' },
    ...participants
  ];

  const filteredParticipants = allParticipants.filter(p => {
    const name = (p.name || p.userName || '').toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="h-full flex flex-col" style={{ background: '#0d0d0d' }}>
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm">
            Participants
          </h3>
          <span className="text-xs text-white/40 bg-white/5 px-2.5 py-1 rounded-full font-medium">
            {allParticipants.length}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search participants..."
            className="w-full rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/15 transition-all"
            style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)' }}
          />
        </div>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <AnimatePresence initial={false}>
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/20 text-sm">No participants found</p>
            </div>
          ) : (
            filteredParticipants.map((participant, index) => (
              <ParticipantCard
                key={participant.userId || index}
                participant={participant}
                isHost={isHost}
                isCurrentUser={participant.isLocal}
                isParticipantHost={participant.isHost}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ParticipantCard({ participant, isHost, isCurrentUser, isParticipantHost }) {
  const name = participant.name || participant.userName || 'Unknown';
  const isMuted = participant.is_muted || false;
  const isVideoOn = participant.is_video_on !== false;
  const isHandRaised = participant.is_hand_raised || false;
  const isScreenSharing = participant.is_screen_sharing || false;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-white/[0.03] transition-colors group"
    >
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarGradient(name)} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 shadow-sm`}>
        {name.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white text-sm font-medium truncate">
            {name}
          </p>
          {isCurrentUser && (
            <span className="text-[10px] text-white/40 border border-white/10 px-1.5 py-0.5 rounded-full font-medium">
              You
            </span>
          )}
          {isParticipantHost && (
            <span className="text-amber-400" title="Host">
              <CrownIcon />
            </span>
          )}
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 mt-0.5">
          {isScreenSharing && (
            <span className="text-blue-400 flex items-center gap-1 text-[10px]">
              <ScreenShareIcon />
              <span>Presenting</span>
            </span>
          )}
        </div>
      </div>

      {/* Right: Status Icons */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {isHandRaised && (
          <motion.span
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            className="text-base"
            title="Hand Raised"
          >
            ✋
          </motion.span>
        )}

        <span className={isMuted ? 'text-red-400/60' : 'text-white/30'} title={isMuted ? 'Muted' : 'Mic On'}>
          {isMuted ? <MicOffIcon /> : <MicIcon />}
        </span>

        <span className={!isVideoOn ? 'text-red-400/60' : 'text-white/30'} title={isVideoOn ? 'Camera On' : 'Camera Off'}>
          {isVideoOn ? <VideoIcon /> : <VideoOffIcon />}
        </span>
      </div>
    </motion.div>
  );
}
