import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function VideoGrid({ 
  localStream, 
  remoteStreams, 
  participants, 
  currentUser,
  isScreenSharing 
}) {
  const totalParticipants = (remoteStreams?.size || 0) + 1;

  const getGridClass = () => {
    if (totalParticipants === 1) return 'grid-cols-1';
    if (totalParticipants === 2) return 'grid-cols-2';
    if (totalParticipants <= 4) return 'grid-cols-2';
    return 'grid-cols-3';
  };

  return (
    <div className={`w-full h-full grid ${getGridClass()} gap-4 p-4`}>
      {/* Local Video */}
      <VideoTile
        stream={localStream}
        name="You"
        isMuted={true}
        isLocal={true}
        participantData={{ is_video_on: true }}
      />

      {/* Remote Videos */}
      {Array.from(remoteStreams?.entries() || []).map(([userId, stream]) => {
        const participant = participants.find(p => p.userId === userId);
        return (
          <VideoTile
            key={userId}
            stream={stream}
            name={participant?.userName || 'Participant'}
            isMuted={participant?.is_muted === true}
            participantData={participant}
          />
        );
      })}
    </div>
  );
}

function VideoTile({ stream, name, isMuted, isLocal = false, participantData }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      // For remote videos, ensure audio is not muted
      if (!isLocal) {
        videoRef.current.muted = false;
        videoRef.current.volume = 1.0;
      }
      
      // Ensure video plays
      videoRef.current.play().catch(err => {
        console.log('Video play error (usually auto-play policy):', err.message);
      });
    }
  }, [stream, isLocal]);
  
  // Watch for video track enabled changes
  useEffect(() => {
    if (!stream) return;
    
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;
    
    // When track is re-enabled, trigger video to play
    const handleTrackEnabled = () => {
      if (videoRef.current && videoTrack.enabled) {
        console.log('📹 Video track enabled, triggering play');
        videoRef.current.play().catch(err => console.log('Play error:', err.message));
      }
    };
    
    // Check periodically if track enabled state changed
    const interval = setInterval(() => {
      if (videoTrack.enabled && videoRef.current?.paused) {
        handleTrackEnabled();
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [stream]);

  const isVideoOn = stream ? true : (participantData?.is_video_on !== false);
  const isHandRaised = participantData?.is_hand_raised || false;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video flex items-center justify-center"
    >
      {/* Video Element */}
      {isVideoOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-700">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center text-3xl text-white mx-auto mb-2">
              {name.charAt(0).toUpperCase()}
            </div>
            <p className="text-white text-sm">Camera Off</p>
          </div>
        </div>
      )}

      {/* Participant Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium">{name}</span>
            {isMuted && (
              <span className="text-red-400" title="Muted">
                🔇
              </span>
            )}
          </div>
          
          {isHandRaised && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-2xl"
              title="Hand Raised"
            >
              ✋
            </motion.span>
          )}
        </div>
      </div>

      {/* Screen Sharing Indicator */}
      {participantData?.is_screen_sharing && (
        <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded">
          Sharing Screen
        </div>
      )}

      {/* Local Badge */}
      {isLocal && (
        <div className="absolute top-3 left-3 bg-green-600 text-white text-xs px-2 py-1 rounded">
          You
        </div>
      )}
    </motion.div>
  );
}
