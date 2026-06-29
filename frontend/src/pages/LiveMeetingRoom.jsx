import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import socketClient from '../lib/socketClient';
import WebRTCManager from '../lib/webrtcManager';
import VideoGrid from '../components/meeting/VideoGrid';
import ControlBar from '../components/meeting/ControlBar';
import ChatPanel from '../components/meeting/ChatPanel';
import ParticipantsPanel from '../components/meeting/ParticipantsPanel';
import TranscriptPanel from '../components/meeting/TranscriptPanel';
import PollPanel from '../components/meeting/PollPanel';

// SVG Icons for sidebar tabs
const ChatTabIcon = ({ active }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--info)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const PeopleTabIcon = ({ active }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--info)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const TranscriptTabIcon = ({ active }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--info)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
const PollsTabIcon = ({ active }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--info)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;

// Hook to detect mobile
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);
  return isMobile;
}

export default function LiveMeetingRoom() {
  const { id: meetingId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Meeting state
  const [meeting, setMeeting] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isHost, setIsHost] = useState(false);
  
  // Media state
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [liveCaption, setLiveCaption] = useState(null);
  
  // UI state
  const [sidebarTab, setSidebarTab] = useState('chat');
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pinnedUserId, setPinnedUserId] = useState(null);
  const [reactions, setReactions] = useState([]);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [layoutMode, setLayoutMode] = useState('grid');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Chat and features
  const [chatMessages, setChatMessages] = useState([]);
  const [transcriptSegments, setTranscriptSegments] = useState([]);
  const [polls, setPolls] = useState([]);
  
  // Refs
  const webrtcManagerRef = useRef(null);
  const localVideoRef = useRef(null);
  const socketConnectedRef = useRef(false);
  const recognitionRef = useRef(null);
  const meetingStartTimeRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const joinTimeRef = useRef(null);
  const captionTimeoutRef = useRef(null);
  const currentUserRef = useRef(null); // Keep a ref so callbacks have access
  const isMutedRef = useRef(true); // Keep track for recognition
  const meetingContainerRef = useRef(null);

  // Keep currentUserRef in sync
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  // Update sidebar visibility when switching between mobile/desktop
  useEffect(() => {
    if (isMobile) {
      setShowSidebar(false);
    }
  }, [isMobile]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      const elem = meetingContainerRef.current || document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, []);

  // Listen to fullscreen change events
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Meeting duration timer
  useEffect(() => {
    if (!loading && !error) {
      joinTimeRef.current = Date.now();
      durationIntervalRef.current = setInterval(() => {
        setMeetingDuration(Math.floor((Date.now() - joinTimeRef.current) / 1000));
      }, 1000);
    }
    return () => { if (durationIntervalRef.current) clearInterval(durationIntervalRef.current); };
  }, [loading, error]);

  // Clean up old reactions
  useEffect(() => {
    if (reactions.length > 0) {
      const timer = setTimeout(() => { setReactions(prev => prev.filter(r => Date.now() - r.timestamp < 3000)); }, 3000);
      return () => clearTimeout(timer);
    }
  }, [reactions]);

  // Initialize meeting
  useEffect(() => {
    if (socketConnectedRef.current) return;
    const reloadKey = `liveMeetingReload:${meetingId}`;
    if (sessionStorage.getItem(reloadKey) === '1') {
      sessionStorage.removeItem(reloadKey);
      navigate('/live-meetings', { replace: true });
      return;
    }
    const handlePageExit = () => { sessionStorage.setItem(reloadKey, '1'); cleanup(); };
    window.addEventListener('beforeunload', handlePageExit);
    window.addEventListener('pagehide', handlePageExit);

    socketConnectedRef.current = true;
    initializeMeeting();
    
    return () => {
      window.removeEventListener('beforeunload', handlePageExit);
      window.removeEventListener('pagehide', handlePageExit);
      cleanup();
      socketConnectedRef.current = false;
    };
  }, [meetingId]);

  const initializeMeeting = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/login'); return; }

      const meetingData = await api.get(`/live-meetings/${meetingId}`, { headers: { Authorization: `Bearer ${session.access_token}` } });
      setMeeting(meetingData);
      const isUserHost = meetingData.user_id === session.user.id;
      setIsHost(isUserHost);

      // Auto-start if scheduled and user is host
      if (meetingData.status === 'scheduled' && isUserHost) {
        try {
          await api.post(`/live-meetings/${meetingId}/start`, {}, { headers: { Authorization: `Bearer ${session.access_token}` } });
          meetingData.status = 'active';
          setMeeting({ ...meetingData });
        } catch (e) {
          console.error("Failed to auto-start meeting:", e);
        }
      }

      let currentParticipant = meetingData.participants?.find(p => p.team_member?.email === session.user.email);
      let userInfo;
      if (!currentParticipant && meetingData.user_id === session.user.id) {
        const { data: { user } } = await supabase.auth.getUser();
        userInfo = { userId: session.user.id, participantId: null, name: user.user_metadata?.display_name || meetingData.creator?.display_name || 'Host', email: session.user.email, isHost: true };
        setCurrentUser(userInfo);
      } else if (currentParticipant) {
        userInfo = { userId: currentParticipant.team_member_id, participantId: currentParticipant.id, name: currentParticipant.team_member?.name || 'Team Member', email: currentParticipant.team_member?.email || session.user.email, isHost: false };
        setCurrentUser(userInfo);
      } else {
        setError('You are not authorized to join this meeting');
        return;
      }

      const stream = await setupMedia();
      const wrm = new WebRTCManager(socketClient, userInfo.userId);
      wrm.localStream = stream;
      webrtcManagerRef.current = wrm;
      wrm.on('remoteStream', ({ userId, stream }) => {
        setRemoteStreams(prev => { const next = new Map(prev); next.set(userId, stream); return next; });
      });
      wrm.on('peerDisconnected', (userId) => {
        setRemoteStreams(prev => { const next = new Map(prev); next.delete(userId); return next; });
      });

      const authData = await socketClient.connect(session.access_token, meetingId, userInfo.userId);
      const mappedParticipants = (authData.participants || []).map(p => ({
        participantId: p.id,
        userId: p.team_member_id,
        userName: p.team_member?.name || 'Participant',
        isHost: p.user_id === meetingData.user_id,
        is_muted: p.is_muted,
        is_video_on: p.is_video_on,
        is_screen_sharing: p.is_screen_sharing,
        is_hand_raised: p.is_hand_raised
      }));
      setParticipants(mappedParticipants);
      
      setupSocketListeners();

      // Start speech recognition for live captions automatically
      startSpeechRecognition(userInfo);

      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to join meeting');
      setLoading(false);
    }
  };

  const setupMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        } 
      });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (err) {
      console.warn("Could not get media devices", err);
      return null;
    }
  };

  // ===== Speech Recognition for Live Captions =====
  const startSpeechRecognition = (userInfo) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    let finalTranscript = '';
    let lastResultTime = Date.now();
    meetingStartTimeRef.current = Date.now();

    recognition.onresult = (event) => {
      let interimText = '';
      let isFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
          isFinal = true;
        } else {
          interimText += transcript;
        }
      }

      lastResultTime = Date.now();
      const speakerName = currentUserRef.current?.name || userInfo.name || 'You';
      const displayText = (isFinal ? finalTranscript : (finalTranscript + interimText)).trim();

      if (displayText) {
        // Show caption locally
        setLiveCaption({ speaker: speakerName, text: displayText, isFinal });

        // Clear caption after a pause (3 seconds after final, or 5s after interim stops)
        if (captionTimeoutRef.current) clearTimeout(captionTimeoutRef.current);
        captionTimeoutRef.current = setTimeout(() => {
          setLiveCaption(null);
        }, isFinal ? 4000 : 6000);

        // Send final segments to backend for transcript storage and broadcast
        if (isFinal && displayText.trim().length > 1) {
          const elapsedSec = (Date.now() - meetingStartTimeRef.current) / 1000;
          socketClient.sendTranscriptSegment({
            text: displayText.trim(),
            speaker_name: speakerName,
            speaker_id: currentUserRef.current?.participantId || null,
            language: 'en',
            confidence: event.results[event.results.length - 1]?.[0]?.confidence || 0.85,
            start_time: Math.max(0, elapsedSec - 3),
            end_time: elapsedSec,
            is_final: true
          });
          finalTranscript = '';
        }
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      console.warn('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      // Auto-restart unless intentionally stopped (user muted)
      if (recognitionRef.current && !isMutedRef.current) {
        try { recognition.start(); } catch (e) { /* ignore */ }
      }
    };

    try {
      if (!isMutedRef.current) {
        recognition.start();
      }
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Could not start speech recognition:', e);
    }
  };

  const setupSocketListeners = () => {
    // The WebRTCManager handles its own socket listeners for peer connections
    // (participant-joined, webrtc-offer, webrtc-answer, ice-candidate)
    // We only need to listen for UI-relevant events here.

    socketClient.on('participant-joined', (newParticipant) => {
      setParticipants(prev => {
        if (!prev.find(p => p.userId === newParticipant.userId)) {
          return [...prev, newParticipant];
        }
        return prev;
      });
    });

    socketClient.on('participant-left', ({ userId }) => {
      setParticipants(prev => prev.filter(p => p.userId !== userId));
    });
    
    socketClient.on('participant-media-update', ({ userId, ...updates }) => {
      setParticipants(prev => prev.map(p => p.userId === userId ? { ...p, ...updates } : p));
    });

    socketClient.on('hand-raise-update', ({ userId, isRaised }) => {
      setParticipants(prev => prev.map(p => p.userId === userId ? { ...p, is_hand_raised: isRaised } : p));
    });
    
    socketClient.on('chat-message', (msg) => { setChatMessages(prev => [...prev, msg]); });

    socketClient.on('reaction', (reaction) => {
      setReactions(prev => [...prev, { ...reaction, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() }]);
    });

    socketClient.on('meeting-ended', () => { cleanup(); navigate('/live-meetings'); });

    // Transcript updates from other participants (for live captions of others)
    socketClient.on('transcript-update', (segment) => {
      setTranscriptSegments(prev => [...prev, segment]);
      // Show caption from other speakers
      if (segment.speaker_display_name && segment.speaker_display_name !== currentUserRef.current?.name) {
        setLiveCaption({ speaker: segment.speaker_display_name, text: segment.text, isFinal: segment.is_final });
        if (captionTimeoutRef.current) clearTimeout(captionTimeoutRef.current);
        captionTimeoutRef.current = setTimeout(() => setLiveCaption(null), 4000);
      }
    });

    socketClient.on('poll-created', (poll) => setPolls(prev => [poll, ...prev]));
    socketClient.on('poll-updated', (poll) => {
      setPolls(prev => prev.map(p => p.id === poll.id ? poll : p));
    });
    socketClient.on('poll-closed', ({ pollId }) => {
      setPolls(prev => prev.map(p => p.id === pollId ? { ...p, is_active: false } : p));
    });
  };

  const cleanup = () => {
    if (localStream) { localStream.getTracks().forEach(t => t.stop()); setLocalStream(null); }
    if (webrtcManagerRef.current) { webrtcManagerRef.current.destroy(); webrtcManagerRef.current = null; }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
      recognitionRef.current = null;
    }
    if (captionTimeoutRef.current) clearTimeout(captionTimeoutRef.current);
    socketClient.disconnect();
  };

  const handleToggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const nowMuted = !audioTrack.enabled;
        setIsMuted(nowMuted);
        socketClient.updateMediaState({ isMuted: nowMuted });

        // Pause/resume speech recognition with mute
        if (nowMuted) {
          if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch(e) {}
            recognitionRef.current = null;
          }
        } else {
          // Resume speech recognition
          startSpeechRecognition(currentUserRef.current);
        }
      }
    }
  };

  const handleToggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
        socketClient.updateMediaState({ isVideoOn: videoTrack.enabled });
      }
    }
  };

  const handleToggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        const screenVideoTrack = screenStream.getVideoTracks()[0];
        screenVideoTrack.onended = () => handleToggleScreenShare();
        webrtcManagerRef.current?.replaceTrack?.(localStream?.getVideoTracks()[0], screenVideoTrack);
        setIsScreenSharing(true);
        socketClient.updateMediaState({ isScreenSharing: true });
      } catch (err) { console.error("Screen share error", err); }
    } else {
      if (localStream) {
        webrtcManagerRef.current?.replaceTrack?.(null, localStream.getVideoTracks()[0]);
        setIsScreenSharing(false);
        socketClient.updateMediaState({ isScreenSharing: false });
      }
    }
  };

  const handleToggleHandRaise = () => {
    const newState = !isHandRaised;
    setIsHandRaised(newState);
    socketClient.raiseHand(newState);
  };

  const handleLeaveMeeting = () => { cleanup(); navigate('/live-meetings'); };

  const handleEndMeeting = async () => {
    try {
      await api.post(`/live-meetings/${meetingId}/end`);
      cleanup();
      navigate('/live-meetings');
    } catch (err) { console.error(err); }
  };

  const handleReaction = (emoji) => {
    const reaction = { userId: currentUser?.userId, userName: currentUser?.name, emoji };
    // Emit directly through socket
    if (socketClient.socket) {
      socketClient.socket.emit('reaction', { emoji });
    }
    setReactions(prev => [...prev, { ...reaction, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() }]);
  };

  // ===== RENDER =====

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: 48, height: 48, margin: '0 auto 24px' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600 }}>Joining secure meeting...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', padding: 16 }}>
      <div className="card" style={{ padding: isMobile ? 24 : 40, textAlign: 'center', maxWidth: 400, width: '100%' }}>
        <div style={{ width: 64, height: 64, background: 'rgba(239,68,68,0.12)', color: 'var(--danger)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 24 }}>⚠</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Unable to Join</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32 }}>{error}</p>
        <button onClick={() => navigate('/live-meetings')} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Back to Meetings</button>
      </div>
    </div>
  );

  const sidebarTabsData = [
    { key: 'chat', label: 'Chat', Icon: ChatTabIcon },
    { key: 'participants', label: 'People', Icon: PeopleTabIcon },
    { key: 'transcript', label: 'Transcript', Icon: TranscriptTabIcon },
    { key: 'polls', label: 'Polls', Icon: PollsTabIcon }
  ];

  return (
    <div ref={meetingContainerRef} style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#000', overflow: 'hidden' }} className={isFullscreen ? 'meeting-fullscreen' : ''}>
      
      {/* Header Bar */}
      <div style={{
        padding: isMobile ? '8px 12px' : '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-base)',
        gap: 8, flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12, minWidth: 0, flex: 1 }}>
          <h1 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: isMobile ? 13 : 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: isMobile ? 180 : 300 }}>{meeting?.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-overlay)', padding: '2px 8px', borderRadius: 100, border: '1px solid var(--border-default)', flexShrink: 0 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 700 }}>{participants.length + 1}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            style={{
              padding: isMobile ? '5px 8px' : '6px 10px', borderRadius: 8,
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600,
              background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
              color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s'
            }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            )}
            {!isMobile && <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>}
          </button>

          {isHost && (
            <button onClick={handleEndMeeting} className="btn-secondary" style={{ padding: isMobile ? '5px 10px' : '6px 12px', fontSize: 12, color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }}>
              {isMobile ? 'End' : 'End Meeting'}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        
        {/* Video Area */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: 'var(--bg-base)' }}>
          <VideoGrid
            localStream={localStream} remoteStreams={remoteStreams} participants={participants} currentUser={currentUser} isScreenSharing={isScreenSharing} pinnedUserId={pinnedUserId} onPinUser={setPinnedUserId} reactions={reactions} layoutMode={layoutMode} isMobile={isMobile}
          />
          
          {/* Live Captions Overlay */}
          <AnimatePresence>
            {showCaptions && liveCaption && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={{ position: 'absolute', bottom: isMobile ? 16 : 32, left: '50%', transform: 'translateX(-50%)', maxWidth: isMobile ? '92%' : '80%', width: isMobile ? '92%' : 'auto', zIndex: 50, pointerEvents: 'none' }}>
                <div style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', padding: isMobile ? '10px 16px' : '14px 24px', borderRadius: isMobile ? 12 : 16, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: isMobile ? 11 : 12, fontWeight: 700, color: 'var(--info)' }}>{liveCaption.speaker}</span>
                    {!liveCaption.isFinal && <span className="spinner" style={{ width: 10, height: 10, borderWidth: 2 }} />}
                  </div>
                  <p style={{ fontSize: isMobile ? 13 : 16, color: '#fff', lineHeight: 1.5, fontWeight: 500, margin: 0 }}>{liveCaption.text}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar — Desktop: side panel, Mobile: bottom sheet overlay */}
        <AnimatePresence>
          {showSidebar && (
            <>
              {/* Mobile overlay backdrop */}
              {isMobile && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowSidebar(false)}
                  style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }}
                />
              )}
              <motion.div
                initial={isMobile ? { y: '100%' } : { width: 0, opacity: 0 }}
                animate={isMobile ? { y: 0 } : { width: 360, opacity: 1 }}
                exit={isMobile ? { y: '100%' } : { width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={isMobile ? 'meeting-sidebar-mobile slide-up-enter' : ''}
                style={{
                  display: 'flex', flexDirection: 'column', overflow: 'hidden',
                  borderLeft: isMobile ? 'none' : '1px solid var(--border-default)',
                  background: 'var(--bg-elevated)', zIndex: isMobile ? 100 : 10,
                  ...(isMobile ? {
                    position: 'fixed', bottom: 0, left: 0, right: 0,
                    height: '60vh', width: '100%',
                    borderRadius: '20px 20px 0 0',
                    borderTop: '1px solid var(--border-default)',
                  } : {})
                }}
              >
                {/* Mobile drag handle */}
                {isMobile && (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px', flexShrink: 0 }}>
                    <div style={{ width: 36, height: 4, borderRadius: 100, background: 'rgba(255,255,255,0.2)' }} />
                  </div>
                )}

                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-base)', flexShrink: 0 }}>
                  {sidebarTabsData.map(tab => (
                    <button
                      key={tab.key} onClick={() => setSidebarTab(tab.key)}
                      style={{
                        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? 3 : 6,
                        padding: isMobile ? '8px 0' : '12px 0', border: 'none', background: 'transparent', cursor: 'pointer',
                        position: 'relative', color: sidebarTab === tab.key ? 'var(--info)' : 'var(--text-secondary)'
                      }}
                    >
                      <tab.Icon active={sidebarTab === tab.key} />
                      <span style={{ fontSize: isMobile ? 9 : 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tab.label}</span>
                      {sidebarTab === tab.key && <motion.div layoutId="sidebarTab" style={{ position: 'absolute', bottom: -1, left: 16, right: 16, height: 2, background: 'var(--info)', borderRadius: '2px 2px 0 0' }} />}
                    </button>
                  ))}
                </div>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  {sidebarTab === 'chat' && <ChatPanel messages={chatMessages} participants={participants} currentUser={currentUser} onSendMessage={(msg, rid, isPriv) => socketClient.sendChatMessage(msg, rid, isPriv)} />}
                  {sidebarTab === 'participants' && <ParticipantsPanel participants={participants} currentUser={currentUser} isHost={isHost} />}
                  {sidebarTab === 'transcript' && <TranscriptPanel segments={transcriptSegments} meetingId={meetingId} />}
                  {sidebarTab === 'polls' && <PollPanel polls={polls} currentUser={currentUser} isHost={isHost} onCreatePoll={(q, o, am, anon) => socketClient.createPoll(q, o, am, anon)} onVotePoll={(pid, oids) => socketClient.votePoll(pid, oids)} onClosePoll={pid => socketClient.closePoll(pid)} />}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Control Bar */}
      <ControlBar isMuted={isMuted} isVideoOn={isVideoOn} isScreenSharing={isScreenSharing} isHandRaised={isHandRaised} onToggleMute={handleToggleMute} onToggleVideo={handleToggleVideo} onToggleScreenShare={handleToggleScreenShare} onToggleHandRaise={handleToggleHandRaise} onLeaveMeeting={handleLeaveMeeting} showSidebar={showSidebar} onToggleSidebar={() => setShowSidebar(!showSidebar)} onReaction={handleReaction} onToggleCaptions={() => setShowCaptions(!showCaptions)} showCaptions={showCaptions} meetingDuration={meetingDuration} layoutMode={layoutMode} onChangeLayout={setLayoutMode} isMobile={isMobile} isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />

      <video ref={localVideoRef} autoPlay muted playsInline style={{ display: 'none' }} />
    </div>
  );
}
