import { useState, useEffect, useRef } from 'react';
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

export default function LiveMeetingRoom() {
  const { id: meetingId } = useParams();
  const navigate = useNavigate();
  
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
  const [showCaptions, setShowCaptions] = useState(true); // Show live captions
  const [liveCaption, setLiveCaption] = useState(null); // Current caption to display
  const [isTranscriptionEnabled, setIsTranscriptionEnabled] = useState(false); // Manual toggle for transcription
  
  // UI state
  const [sidebarTab, setSidebarTab] = useState('chat'); // chat, participants, transcript, polls
  const [showSidebar, setShowSidebar] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Chat and features
  const [chatMessages, setChatMessages] = useState([]);
  const [transcriptSegments, setTranscriptSegments] = useState([]);
  const [polls, setPolls] = useState([]);
  
  // Refs
  const webrtcManagerRef = useRef(null);
  const localVideoRef = useRef(null);
  const socketConnectedRef = useRef(false); // Track if socket is connected
  const recognitionRef = useRef(null); // Speech recognition
  const meetingStartTimeRef = useRef(null); // Track meeting start time for timestamps

  // Initialize meeting
  useEffect(() => {
    // Prevent multiple initializations
    if (socketConnectedRef.current) {
      console.log('⚠️ Already initialized, skipping');
      return;
    }

    const reloadKey = `liveMeetingReload:${meetingId}`;
    const shouldForceRejoin = sessionStorage.getItem(reloadKey) === '1';

    if (shouldForceRejoin) {
      sessionStorage.removeItem(reloadKey);
      console.log('🔄 Meeting page was refreshed, sending user back to meetings list');
      navigate('/live-meetings', { replace: true });
      return;
    }

    const handlePageExit = () => {
      console.log('🚪 Page is unloading, disconnecting meeting session');
      sessionStorage.setItem(reloadKey, '1');
      cleanup();
    };

    window.addEventListener('beforeunload', handlePageExit);
    window.addEventListener('pagehide', handlePageExit);

    console.log('🚀 Starting meeting initialization');
    socketConnectedRef.current = true;
    initializeMeeting();
    
    return () => {
      console.log('🧹 Cleaning up meeting room');
      window.removeEventListener('beforeunload', handlePageExit);
      window.removeEventListener('pagehide', handlePageExit);
      cleanup();
      socketConnectedRef.current = false;
    };
  }, [meetingId]);

  const initializeMeeting = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      // Fetch meeting details
      const meetingData = await api.get(`/live-meetings/${meetingId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      // Backend returns meeting data directly, not nested under .data
      setMeeting(meetingData);
      setIsHost(meetingData.user_id === session.user.id);

      // Find current user's participant record or use host info
      let currentParticipant = meetingData.participants?.find(p => 
        p.team_member?.email === session.user.email
      );

      let userInfo;
      
      // If user is the host but not in participants, allow them as host
      if (!currentParticipant && meetingData.user_id === session.user.id) {
        // Host can join even if not in participants list
        // Note: participantId will be set by backend when socket authenticates
        const { data: { user } } = await supabase.auth.getUser();
        userInfo = {
          userId: session.user.id,
          participantId: null, // Will be set by backend
          name: user.user_metadata?.display_name || meetingData.creator?.display_name || 'Host',
          email: session.user.email,
          isHost: true
        };
        setCurrentUser(userInfo);
      } else if (currentParticipant) {
        // Team member joining
        userInfo = {
          userId: currentParticipant.team_member_id, // Use team_member_id for Socket.IO
          participantId: currentParticipant.id,
          name: currentParticipant.team_member?.name || 'Team Member',
          email: currentParticipant.team_member?.email || session.user.email,
          isHost: false
        };
        setCurrentUser(userInfo);
      } else {
        setError('You are not authorized to join this meeting');
        return;
      }

      // Start meeting if host and not started
      if (meetingData.user_id === session.user.id && meetingData.status === 'scheduled') {
        try {
          await api.post(`/live-meetings/${meetingId}/start`, {}, {
            headers: { Authorization: `Bearer ${session.access_token}` }
          });
        } catch (startError) {
          // If already active, that's fine - continue
          if (!startError.message?.includes('already active')) {
            console.error('Error starting meeting:', startError);
          }
        }
      }

      // Initialize media FIRST and get the stream
      const stream = await initializeMedia();

      // Initialize WebRTC with the stream and current user ID
      webrtcManagerRef.current = new WebRTCManager(socketClient, userInfo.userId);
      webrtcManagerRef.current.localStream = stream;
      
      setupWebRTCListeners();

      // Setup Socket.IO listeners BEFORE connecting
      setupSocketListeners();

      // Connect to Socket.IO - this will trigger participant-joined events
      await socketClient.connect(
        session.access_token,
        meetingId,
        userInfo.userId
      );

      // Load existing data
      await loadMeetingData(session.access_token);

      // Initialize speech recognition for transcription
      initializeSpeechRecognition();

      setLoading(false);

    } catch (error) {
      console.error('Error initializing meeting:', error);
      setError(error.message || 'Failed to join meeting');
      setLoading(false);
    }
  };

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log('Local media initialized');
      return stream; // Return the stream so it can be used immediately

    } catch (error) {
      console.error('Error accessing media devices:', error);
      setError('Could not access camera/microphone. Please check permissions.');
      throw error;
    }
  };

  const setupWebRTCListeners = () => {
    const webrtc = webrtcManagerRef.current;
    
    console.log('🎧 Setting up WebRTC listeners');

    webrtc.on('localStream', (stream) => {
      console.log('📹 Local stream received in component');
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    });

    webrtc.on('remoteStream', ({ userId, stream }) => {
      console.log('📺 Remote stream received in component from userId:', userId);
      console.log('   Stream has', stream.getTracks().length, 'tracks');
      setRemoteStreams(prev => {
        const updated = new Map(prev);
        updated.set(userId, stream);
        console.log('✅ Updated remoteStreams, now has', updated.size, 'streams');
        return updated;
      });
    });

    webrtc.on('peerDisconnected', (userId) => {
      setRemoteStreams(prev => {
        const updated = new Map(prev);
        updated.delete(userId);
        return updated;
      });
    });

    webrtc.on('peerError', ({ userId, error }) => {
      console.error('Peer error:', userId, error);
    });
  };

  const setupSocketListeners = () => {
    // Auth success - update current user with participant ID from backend
    socketClient.on('auth-success', (data) => {
      console.log('✅ Socket auth successful, updating participant ID:', data.participantId);
      setCurrentUser(prev => {
        if (prev) {
          return {
            ...prev,
            participantId: data.participantId
          };
        }
        return prev;
      });

      if (webrtcManagerRef.current && data.participantId) {
        webrtcManagerRef.current.currentUserId = data.participantId;
      }
    });

    // Participant events
    socketClient.on('participant-joined', (data) => {
      console.log('🔔 [Frontend] Participant joined:', data.userName, 'userId:', data.userId);
      setParticipants(prev => {
        // Avoid duplicates
        if (prev.some(p => p.userId === data.userId)) {
          console.log('⚠️ [Frontend] Participant already in list, skipping');
          return prev;
        }
        console.log('✅ [Frontend] Adding participant to list');
        return [...prev, data];
      });
    });

    socketClient.on('participant-left', (data) => {
      console.log('Participant left:', data);
      setParticipants(prev => prev.filter(p => p.userId !== data.userId));
    });

    socketClient.on('participant-media-update', (data) => {
      setParticipants(prev => prev.map(p => 
        p.userId === data.userId ? { ...p, ...data } : p
      ));
    });

    // Chat events
    socketClient.on('chat-message', (message) => {
      setChatMessages(prev => [...prev, message]);
    });

    // Transcript events
    socketClient.on('transcript-update', (segment) => {
      // Use the backend as the source of truth for final transcript entries.
      // Skip local echo for our own final segment because the local interim
      // already rendered the text and the server will broadcast the final copy.
      const isOwnSegment = segment.speaker_id && currentUser?.participantId && segment.speaker_id === currentUser.participantId;

      if (!isOwnSegment || !segment.is_final) {
        setTranscriptSegments(prev => {
          const next = [...prev];

          // Prevent duplicate final rows when the same final segment is broadcast
          // back to the author after local interim rendering.
          const duplicateIndex = next.findIndex(item =>
            item.id && segment.id && item.id === segment.id
          );

          if (duplicateIndex !== -1) {
            next[duplicateIndex] = segment;
            return next;
          }

          return [...next, segment];
        });
      }

      // Show live caption only for remote speakers or final server updates.
      // This prevents the host from seeing duplicate local + server captions.
      if (!isOwnSegment || !segment.is_final) {
        setLiveCaption({
          text: segment.text,
          speaker: segment.speaker_display_name || segment.speaker_name,
          isFinal: segment.is_final,
          timestamp: Date.now()
        });
      }

      // Display captions from other participants with speaker attribution
      // Only show captions from others if they're final and not from current user
      if (segment.is_final && segment.speaker_id !== currentUser?.participantId) {
        console.log('📝 Received transcript from participant:', segment.speaker_display_name || segment.speaker_name);
        
        // Show caption from other participant
        const otherCaption = {
          text: segment.text,
          speaker: segment.speaker_display_name || segment.speaker_name || 'Participant',
          isFinal: true,
          isFromOther: true,
          timestamp: Date.now()
        };
        
        setLiveCaption(otherCaption);
        
        // Clear after 3 seconds
        const captionTimestamp = Date.now();
        setTimeout(() => {
          setLiveCaption(prev => {
            // Only clear if this is still the current caption
            if (prev?.timestamp === captionTimestamp) {
              return null;
            }
            return prev;
          });
        }, 3000);
      }
    });

    // Poll events
    socketClient.on('poll-created', (poll) => {
      setPolls(prev => [...prev, poll]);
    });

    socketClient.on('poll-updated', (updatedPoll) => {
      setPolls(prev => prev.map(p => 
        p.id === updatedPoll.id ? updatedPoll : p
      ));
    });

    socketClient.on('poll-closed', ({ pollId }) => {
      setPolls(prev => prev.map(p => 
        p.id === pollId ? { ...p, is_active: false } : p
      ));
    });

    // Hand raise events
    socketClient.on('hand-raise-update', (data) => {
      setParticipants(prev => prev.map(p => 
        p.userId === data.userId 
          ? { ...p, is_hand_raised: data.isRaised }
          : p
      ));
    });

    // Meeting end event
    socketClient.on('meeting-ended', (data) => {
      alert('Meeting has ended');
      navigate(`/live-meetings/${meetingId}/results`);
    });
  };

  const loadMeetingData = async (token) => {
    try {
      // Load chat history
      const chatData = await api.get(`/live-meetings/${meetingId}/chat`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatMessages(Array.isArray(chatData) ? chatData : (chatData.data || []));

      // Load polls
      const pollsData = await api.get(`/live-meetings/${meetingId}/polls`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPolls(Array.isArray(pollsData) ? pollsData : (pollsData.data || []));

      // Load transcript
      const transcriptData = await api.get(`/live-meetings/${meetingId}/transcript`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTranscriptSegments(transcriptData.segments || []);

    } catch (error) {
      console.error('Error loading meeting data:', error);
    }
  };

  const cleanup = () => {
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    // Stop local media
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    // Destroy WebRTC
    if (webrtcManagerRef.current) {
      webrtcManagerRef.current.destroy();
    }

    // Disconnect Socket.IO
    socketClient.disconnect();
  };

  const initializeSpeechRecognition = () => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.log('⚠️ Speech Recognition not supported in this browser');
      return;
    }

    // Stop any existing recognition first
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors when stopping
      }
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = meeting?.transcript_language || 'en-US';

      meetingStartTimeRef.current = Date.now();

      recognition.onstart = () => {
        console.log('🎤 Speech recognition started');
        setIsTranscriptionEnabled(true);
      };

      recognition.onresult = (event) => {
        // CRITICAL FIX: Check if microphone is muted before processing
        if (isMuted) {
          console.log('🔇 Mic is muted, ignoring speech recognition results');
          return; // Don't process if muted
        }

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence;
          const isFinal = result.isFinal;

          // Only process non-empty transcripts
          if (!transcript.trim()) {
            continue;
          }

          const currentTime = (Date.now() - meetingStartTimeRef.current) / 1000;

          // FIX: Use snake_case to match backend expectations
          const segment = {
            text: transcript.trim(),
            confidence: confidence,
            is_final: isFinal,
            start_time: currentTime,
            end_time: currentTime + 1,
            language: meeting?.transcript_language || 'en',
            speaker_name: currentUser?.name || 'You',
            speaker_id: currentUser?.participantId || 'unknown'
          };

          // Show live caption with speaker name for multi-participant scenarios
          setLiveCaption({
            text: transcript,
            speaker: currentUser?.name || 'You',
            isFinal: isFinal,
            timestamp: Date.now() // Add timestamp for clearing
          });

          // CRITICAL FIX: Only clear caption after delay if it's still the same caption
          if (isFinal) {
            const captionTimestamp = Date.now();
            setTimeout(() => {
              setLiveCaption(prev => {
                // Only clear if this is still the current caption (same timestamp)
                if (prev?.timestamp === captionTimestamp) {
                  return null;
                }
                return prev;
              });
            }, 3000);
          }

          // Send to server only if final
          if (isFinal) {
            console.log('📤 Sending final transcript segment:', transcript);
            socketClient.sendTranscriptSegment(segment);
          }

          // Update local state for real-time display
          setTranscriptSegments(prev => {
            // Replace interim results, append final results
            if (isFinal) {
              return [...prev, segment];
            } else {
              // Remove last interim result and add new one
              const filtered = prev.filter(s => s.is_final);
              return [...filtered, segment];
            }
          });
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        // Stop recognition on any error to prevent infinite loops
        if (recognitionRef.current) {
          recognitionRef.current = null;
          setIsTranscriptionEnabled(false);
        }
        
        // Show user-friendly error
        if (event.error === 'not-allowed' || event.error === 'audio-capture') {
          setError('Microphone access denied. Please allow microphone access to enable transcription.');
        } else if (event.error === 'aborted') {
          console.log('⏸️ Speech recognition aborted - may be microphone conflict with video call');
        }
      };

      recognition.onend = () => {
        console.log('🎤 Speech recognition ended');
        // Only restart if user manually enabled it, it's still in ref, AND mic is not muted
        if (recognitionRef.current && isTranscriptionEnabled && !isMuted) {
          setTimeout(() => {
            try {
              console.log('🔄 Restarting speech recognition after it ended');
              recognition.start();
            } catch (err) {
              console.log('Could not restart recognition:', err.message);
              recognitionRef.current = null;
              setIsTranscriptionEnabled(false);
            }
          }, 500);
        } else {
          setIsTranscriptionEnabled(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      console.log('✅ Speech recognition initialized');
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      setIsTranscriptionEnabled(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Error stopping recognition:', e.message);
      }
      recognitionRef.current = null;
    }
    setIsTranscriptionEnabled(false);
    setLiveCaption(null);
  };

  const toggleTranscription = () => {
    if (isTranscriptionEnabled) {
      stopSpeechRecognition();
    } else {
      initializeSpeechRecognition();
    }
  };

  // Control handlers
  const handleToggleMute = () => {
    if (webrtcManagerRef.current) {
      const newState = !isMuted;
      webrtcManagerRef.current.toggleAudio(!newState);
      setIsMuted(newState);
      
      // CRITICAL FIX: Stop/restart speech recognition based on mute state
      // When muting: stop recognizing
      if (newState === true) {
        // User just muted
        if (recognitionRef.current && isTranscriptionEnabled) {
          console.log('🔇 Stopping speech recognition (mic muted)');
          try {
            recognitionRef.current.stop();
          } catch (e) {
            console.log('Error stopping recognition:', e.message);
          }
        }
      } else {
        // User just unmuted - restart transcription if it was enabled
        if (isTranscriptionEnabled && recognitionRef.current) {
          console.log('🎤 Restarting speech recognition (mic unmuted)');
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.log('Error restarting recognition:', e.message);
          }
        }
      }
    }
  };

  const handleToggleVideo = () => {
    if (webrtcManagerRef.current) {
      const newState = !isVideoOn;
      webrtcManagerRef.current.toggleVideo(newState);
      setIsVideoOn(newState);
    }
  };

  const handleToggleScreenShare = async () => {
    if (!webrtcManagerRef.current) return;

    try {
      if (isScreenSharing) {
        await webrtcManagerRef.current.stopScreenShare();
        setIsScreenSharing(false);
      } else {
        await webrtcManagerRef.current.startScreenShare();
        setIsScreenSharing(true);
      }
    } catch (error) {
      console.error('Screen share error:', error);
      alert('Failed to share screen. Please try again.');
    }
  };

  const handleToggleHandRaise = () => {
    const newState = !isHandRaised;
    socketClient.raiseHand(newState);
    setIsHandRaised(newState);
  };

  const handleLeaveMeeting = () => {
    if (confirm('Are you sure you want to leave the meeting?')) {
      cleanup();
      navigate('/live-meetings');
    }
  };

  const handleEndMeeting = async () => {
    if (!isHost) return;
    
    if (confirm('Are you sure you want to end this meeting for everyone?')) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await api.post(`/live-meetings/${meetingId}/end`, {}, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        
        cleanup();
        navigate(`/live-meetings/${meetingId}/results`);
      } catch (error) {
        console.error('Error ending meeting:', error);
        alert('Failed to end meeting. Please try again.');
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg">Joining meeting...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Unable to Join Meeting</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/live-meetings')}
            className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back to Meetings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-white font-semibold text-lg">{meeting?.title}</h1>
          <div className="flex items-center gap-2">
            <p className="text-gray-400 text-sm">
              {participants.length + 1} participant{participants.length !== 0 ? 's' : ''}
            </p>
            {/* Transcription Status Indicator */}
            {isTranscriptionEnabled && (
              <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-red-600/20 rounded-full">
                <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-red-400 font-medium">Recording</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Transcription Toggle Button */}
          <button
            onClick={toggleTranscription}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isTranscriptionEnabled
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
            }`}
            title={isTranscriptionEnabled ? 'Stop Recording' : 'Start Recording'}
          >
            🎙️ {isTranscriptionEnabled ? 'Recording' : 'Record'}
          </button>

          {isHost && (
            <button
              onClick={handleEndMeeting}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              End Meeting
            </button>
          )}
          
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {showSidebar ? '→' : '←'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 flex items-center justify-center p-4 relative">
          <VideoGrid
            localStream={localStream}
            remoteStreams={remoteStreams}
            participants={participants}
            currentUser={currentUser}
            isScreenSharing={isScreenSharing}
          />
          
          {/* Live Captions Overlay */}
          {showCaptions && liveCaption && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2 max-w-2xl w-full px-4"
            >
              <div className="bg-black/80 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-blue-400">
                    {liveCaption.speaker}
                  </span>
                  {!liveCaption.isFinal && (
                    <span className="text-xs text-yellow-400">⏳</span>
                  )}
                </div>
                <p className="text-base leading-relaxed">
                  {liveCaption.text}
                </p>
              </div>
            </motion.div>
          )}
          
          {/* Caption Toggle Button */}
          <button
            onClick={() => setShowCaptions(!showCaptions)}
            className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg transition-colors"
            title={showCaptions ? 'Hide Captions' : 'Show Captions'}
          >
            {showCaptions ? '💬' : '🚫'}
          </button>
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col"
            >
              {/* Sidebar Tabs */}
              <div className="flex border-b border-gray-800">
                {[
                  { key: 'chat', label: 'Chat', icon: '💬' },
                  { key: 'participants', label: 'People', icon: '👥' },
                  { key: 'transcript', label: 'Transcript', icon: '📝' },
                  { key: 'polls', label: 'Polls', icon: '📊' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setSidebarTab(tab.key)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      sidebarTab === tab.key
                        ? 'text-white border-b-2 border-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="mr-1">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-hidden">
                {sidebarTab === 'chat' && (
                  <ChatPanel
                    messages={chatMessages}
                    participants={participants}
                    currentUser={currentUser}
                    onSendMessage={(message, recipientId, isPrivate) => {
                      socketClient.sendChatMessage(message, recipientId, isPrivate);
                    }}
                  />
                )}

                {sidebarTab === 'participants' && (
                  <ParticipantsPanel
                    participants={participants}
                    currentUser={currentUser}
                    isHost={isHost}
                  />
                )}

                {sidebarTab === 'transcript' && (
                  <TranscriptPanel
                    segments={transcriptSegments}
                    meetingId={meetingId}
                  />
                )}

                {sidebarTab === 'polls' && (
                  <PollPanel
                    polls={polls}
                    currentUser={currentUser}
                    isHost={isHost}
                    onCreatePoll={(question, options, allowMultiple, anonymous) => {
                      socketClient.createPoll(question, options, allowMultiple, anonymous);
                    }}
                    onVotePoll={(pollId, optionIds) => {
                      socketClient.votePoll(pollId, optionIds);
                    }}
                    onClosePoll={(pollId) => {
                      socketClient.closePoll(pollId);
                    }}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Bar */}
      <ControlBar
        isMuted={isMuted}
        isVideoOn={isVideoOn}
        isScreenSharing={isScreenSharing}
        isHandRaised={isHandRaised}
        onToggleMute={handleToggleMute}
        onToggleVideo={handleToggleVideo}
        onToggleScreenShare={handleToggleScreenShare}
        onToggleHandRaise={handleToggleHandRaise}
        onLeaveMeeting={handleLeaveMeeting}
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
      />

      {/* Hidden local video reference */}
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        style={{ display: 'none' }}
      />
    </div>
  );
}
