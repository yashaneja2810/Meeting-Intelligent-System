import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// SVG Icons
const PinIcon = ({ pinned }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={pinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 17v5" /><path d="M9 2h6l-1 7h3l-5 7-5-7h3z" />
  </svg>
);

const MicOffIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.13 1.49-.35 2.17" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const ScreenShareIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

// Hook to detect audio levels from a MediaStream
function useAudioLevel(stream, isLocal) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!stream) return;
    const audioTracks = stream.getAudioTracks();
    if (!audioTracks.length) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let speakingTimeout = null;

      const detect = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        const threshold = isLocal ? 15 : 12;

        if (avg > threshold) {
          setIsSpeaking(true);
          if (speakingTimeout) clearTimeout(speakingTimeout);
          speakingTimeout = setTimeout(() => setIsSpeaking(false), 600);
        }
        rafRef.current = requestAnimationFrame(detect);
      };

      detect();
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (speakingTimeout) clearTimeout(speakingTimeout);
        source.disconnect();
        audioContext.close();
      };
    } catch (e) {
      console.log('Audio level detection not available:', e.message);
    }
  }, [stream, isLocal]);

  return isSpeaking;
}

export default function VideoGrid({
  localStream,
  remoteStreams,
  participants,
  currentUser,
  isScreenSharing,
  pinnedUserId,
  onPinUser,
  reactions,
  layoutMode = 'grid'
}) {
  const totalParticipants = (remoteStreams?.size || 0) + 1;
  const allStreams = [];

  // Local user
  allStreams.push({
    id: 'local',
    stream: localStream,
    name: currentUser?.name || 'You',
    isLocal: true,
    participantData: { is_video_on: true },
    isMuted: true
  });

  // Remote users
  if (remoteStreams) {
    for (const [userId, stream] of remoteStreams.entries()) {
      const participant = participants.find(p => p.userId === userId);
      allStreams.push({
        id: userId,
        stream,
        name: participant?.userName || 'Participant',
        isLocal: false,
        participantData: participant || {},
        isMuted: participant?.is_muted === true
      });
    }
  }

  const hasScreenShare = isScreenSharing || participants.some(p => p.is_screen_sharing);
  const hasPinned = !!pinnedUserId;
  const effectiveLayout = hasScreenShare ? 'spotlight' : (hasPinned ? 'spotlight' : layoutMode);
  const spotlightId = pinnedUserId || (hasScreenShare ? (participants.find(p => p.is_screen_sharing)?.userId || (isScreenSharing ? 'local' : null)) : null);

  const spotlightStream = allStreams.find(s => s.id === spotlightId);
  const filmstripStreams = allStreams.filter(s => s.id !== spotlightId);

  // ======== SPOTLIGHT / PIN LAYOUT ========
  if (effectiveLayout === 'spotlight' && spotlightStream) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', gap: 12, padding: 12 }}>
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <VideoTile
            key={spotlightStream.id} stream={spotlightStream.stream} name={spotlightStream.name} isMuted={spotlightStream.isMuted} isLocal={spotlightStream.isLocal} participantData={spotlightStream.participantData} isPinned={true} isSpotlight={true} isScreenShare={spotlightId === 'local' ? isScreenSharing : spotlightStream.participantData?.is_screen_sharing} onPin={() => onPinUser?.(spotlightStream.id === pinnedUserId ? null : spotlightStream.id)} reactions={reactions?.filter(r => r.userId === spotlightStream.id)}
          />
        </div>
        {filmstripStreams.length > 0 && (
          <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }} className="custom-scrollbar">
            {filmstripStreams.map(s => (
              <div key={s.id} style={{ flexShrink: 0 }}>
                <VideoTile
                  stream={s.stream} name={s.name} isMuted={s.isMuted} isLocal={s.isLocal} participantData={s.participantData} isPinned={false} isCompact={true} onPin={() => onPinUser?.(s.id)} reactions={reactions?.filter(r => r.userId === s.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ======== SPEAKER VIEW ========
  if (effectiveLayout === 'speaker') {
    const speakerStream = allStreams[0];
    const otherStreams = allStreams.slice(1);
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 12, padding: 12 }}>
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <VideoTile key={speakerStream.id} stream={speakerStream.stream} name={speakerStream.name} isMuted={speakerStream.isMuted} isLocal={speakerStream.isLocal} participantData={speakerStream.participantData} isPinned={false} isSpotlight={true} onPin={() => onPinUser?.(speakerStream.id)} reactions={reactions?.filter(r => r.userId === speakerStream.id)} />
        </div>
        {otherStreams.length > 0 && (
          <div style={{ display: 'flex', gap: 12, height: 160, flexShrink: 0, justifyContent: 'center', overflowX: 'auto' }} className="custom-scrollbar">
            {otherStreams.map(s => (
              <div key={s.id} style={{ height: '100%', aspectRatio: '16/9', flexShrink: 0 }}>
                <VideoTile stream={s.stream} name={s.name} isMuted={s.isMuted} isLocal={s.isLocal} participantData={s.participantData} isPinned={false} isCompact={true} onPin={() => onPinUser?.(s.id)} reactions={reactions?.filter(r => r.userId === s.id)} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ======== SIDEBAR VIEW ========
  if (effectiveLayout === 'sidebar') {
    const mainStream = allStreams[0];
    const sideStreams = allStreams.slice(1);
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', gap: 12, padding: 12 }}>
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <VideoTile key={mainStream.id} stream={mainStream.stream} name={mainStream.name} isMuted={mainStream.isMuted} isLocal={mainStream.isLocal} participantData={mainStream.participantData} isPinned={false} isSpotlight={true} onPin={() => onPinUser?.(mainStream.id)} reactions={reactions?.filter(r => r.userId === mainStream.id)} />
        </div>
        {sideStreams.length > 0 && (
          <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }} className="custom-scrollbar">
            {sideStreams.map(s => (
              <div key={s.id} style={{ flexShrink: 0 }}>
                <VideoTile stream={s.stream} name={s.name} isMuted={s.isMuted} isLocal={s.isLocal} participantData={s.participantData} isPinned={false} isCompact={true} onPin={() => onPinUser?.(s.id)} reactions={reactions?.filter(r => r.userId === s.id)} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ======== GRID VIEW ========
  return (
    <div style={{ width: '100%', height: '100%', padding: 12 }}>
      {totalParticipants === 1 && (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 1000, aspectRatio: '16/9' }}>
            <VideoTile stream={allStreams[0].stream} name={allStreams[0].name} isMuted={allStreams[0].isMuted} isLocal={allStreams[0].isLocal} participantData={allStreams[0].participantData} isPinned={false} onPin={() => onPinUser?.(allStreams[0].id)} reactions={reactions?.filter(r => r.userId === allStreams[0].id)} />
          </div>
        </div>
      )}

      {totalParticipants === 2 && (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          {allStreams.map(s => (
            <div key={s.id} style={{ flex: 1, maxWidth: '50%', height: '100%', maxHeight: '80vh', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', aspectRatio: '16/9' }}>
                <VideoTile stream={s.stream} name={s.name} isMuted={s.isMuted} isLocal={s.isLocal} participantData={s.participantData} isPinned={s.id === pinnedUserId} onPin={() => onPinUser?.(s.id === pinnedUserId ? null : s.id)} reactions={reactions?.filter(r => r.userId === s.id)} />
              </div>
            </div>
          ))}
        </div>
      )}

      {totalParticipants === 3 && (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ flex: 1, display: 'flex', gap: 12, minHeight: 0 }}>
            {allStreams.slice(0, 2).map(s => (
              <div key={s.id} style={{ flex: 1, minWidth: 0, height: '100%' }}>
                <VideoTile stream={s.stream} name={s.name} isMuted={s.isMuted} isLocal={s.isLocal} participantData={s.participantData} isPinned={s.id === pinnedUserId} isSpotlight={true} onPin={() => onPinUser?.(s.id === pinnedUserId ? null : s.id)} reactions={reactions?.filter(r => r.userId === s.id)} />
              </div>
            ))}
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minHeight: 0 }}>
            <div style={{ height: '100%', aspectRatio: '16/9' }}>
              <VideoTile stream={allStreams[2].stream} name={allStreams[2].name} isMuted={allStreams[2].isMuted} isLocal={allStreams[2].isLocal} participantData={allStreams[2].participantData} isPinned={allStreams[2].id === pinnedUserId} isSpotlight={true} onPin={() => onPinUser?.(allStreams[2].id === pinnedUserId ? null : allStreams[2].id)} reactions={reactions?.filter(r => r.userId === allStreams[2].id)} />
            </div>
          </div>
        </div>
      )}

      {totalParticipants === 4 && (
        <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 12 }}>
          {allStreams.map(s => (
            <div key={s.id} style={{ width: '100%', height: '100%', minHeight: 0, minWidth: 0 }}>
              <VideoTile stream={s.stream} name={s.name} isMuted={s.isMuted} isLocal={s.isLocal} participantData={s.participantData} isPinned={s.id === pinnedUserId} isSpotlight={true} onPin={() => onPinUser?.(s.id === pinnedUserId ? null : s.id)} reactions={reactions?.filter(r => r.userId === s.id)} />
            </div>
          ))}
        </div>
      )}

      {totalParticipants >= 5 && (
        <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: `repeat(${totalParticipants <= 9 ? 3 : 4}, 1fr)`, gridAutoRows: '1fr', gap: 12 }}>
          {allStreams.map(s => (
            <div key={s.id} style={{ width: '100%', height: '100%', minHeight: 0, minWidth: 0 }}>
              <VideoTile stream={s.stream} name={s.name} isMuted={s.isMuted} isLocal={s.isLocal} participantData={s.participantData} isPinned={s.id === pinnedUserId} isSpotlight={true} onPin={() => onPinUser?.(s.id === pinnedUserId ? null : s.id)} reactions={reactions?.filter(r => r.userId === s.id)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VideoTile({
  stream, name, isMuted, isLocal = false, participantData, isPinned = false, isSpotlight = false, isCompact = false, isScreenShare = false, onPin, reactions = []
}) {
  const videoRef = useRef(null);
  const isSpeaking = useAudioLevel(stream, isLocal);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      if (!isLocal) { videoRef.current.muted = false; videoRef.current.volume = 1.0; }
      videoRef.current.play().catch(err => console.log('Video play error:', err.message));
    }
  }, [stream, isLocal]);

  useEffect(() => {
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;
    const interval = setInterval(() => {
      if (videoTrack.enabled && videoRef.current?.paused) videoRef.current.play().catch(e => console.log(e.message));
    }, 500);
    return () => clearInterval(interval);
  }, [stream]);

  const isVideoOn = stream ? true : (participantData?.is_video_on !== false);
  const isHandRaised = participantData?.is_hand_raised || false;
  
  const getAvatarGradient = (name) => {
    const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const colors = [
      ['#6366f1', '#4f46e5'], ['#3b82f6', '#2563eb'], ['#10b981', '#059669'],
      ['#f59e0b', '#d97706'], ['#ec4899', '#db2777'], ['#8b5cf6', '#7c3aed']
    ];
    const [c1, c2] = colors[hash % colors.length];
    return `linear-gradient(135deg, ${c1}, ${c2})`;
  };

  return (
    <motion.div
      layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'relative', width: '100%', overflow: 'hidden', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
        height: isSpotlight ? '100%' : 'auto', aspectRatio: isSpotlight ? undefined : '16/9', borderRadius: isCompact ? 12 : 20,
        boxShadow: (isSpeaking && !isMuted) ? '0 0 0 4px var(--success), 0 8px 30px rgba(34,197,94,0.3)' : (isScreenShare ? '0 0 0 2px var(--info)' : 'var(--shadow-md)'),
        transition: 'box-shadow 0.2s ease, transform 0.2s ease', zIndex: (isSpeaking && !isMuted) ? 10 : 1
      }}
      className="group"
    >
      {/* Video */}
      {isVideoOn ? (
        <video ref={videoRef} autoPlay playsInline muted={isLocal} style={{ width: '100%', height: '100%', objectFit: isScreenShare ? 'contain' : 'cover', background: '#000' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
          <div style={{ width: isCompact ? 48 : 80, height: isCompact ? 48 : 80, borderRadius: '50%', background: getAvatarGradient(name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: isCompact ? 20 : 32, fontWeight: 700, boxShadow: 'var(--shadow-md)' }}>
            {name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Pin Button */}
      {!isCompact && (
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, opacity: isPinned ? 1 : 0 }} className="group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); onPin?.(); }} style={{ padding: 8, borderRadius: '50%', background: isPinned ? 'var(--info)' : 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', border: 'none', color: '#fff', cursor: 'pointer', transition: 'all 0.2s' }}>
            <PinIcon pinned={isPinned} />
          </button>
        </div>
      )}

      {/* Participant Info */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: isCompact ? '8px 12px' : '16px 20px', background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {isLocal && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />}
          <span style={{ color: '#fff', fontWeight: 600, fontSize: isCompact ? 12 : 14, textShadow: '0 1px 2px rgba(0,0,0,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isLocal ? 'You' : name}
          </span>
          {isMuted && <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center' }}><MicOffIcon /></span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isHandRaised && <motion.span initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} style={{ fontSize: isCompact ? 16 : 20 }}>✋</motion.span>}
          {participantData?.is_screen_sharing && !isScreenShare && <span style={{ color: 'var(--info)' }}><ScreenShareIcon /></span>}
        </div>
      </div>

      {/* Reactions */}
      <AnimatePresence>
        {reactions?.map(reaction => (
          <motion.div key={reaction.id} initial={{ opacity: 1, y: 0, scale: 0.5, x: Math.random() * 60 - 30 }} animate={{ opacity: 0, y: -160, scale: 1.8 }} exit={{ opacity: 0 }} transition={{ duration: 2.5, ease: 'easeOut' }} style={{ position: 'absolute', bottom: 40, left: '50%', fontSize: 32, pointerEvents: 'none', zIndex: 20, marginLeft: `${Math.random() * 40 - 20}px`, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
            {reaction.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
