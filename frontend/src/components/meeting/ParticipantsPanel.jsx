import { motion } from 'framer-motion';

export default function ParticipantsPanel({ participants, currentUser, isHost }) {
  const allParticipants = [
    { ...currentUser, isLocal: true, status: 'joined' },
    ...participants
  ];

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-white font-semibold">
          Participants ({allParticipants.length})
        </h3>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {allParticipants.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-4xl mb-2">👥</p>
            <p className="text-sm">No participants</p>
          </div>
        ) : (
          allParticipants.map((participant, index) => (
            <ParticipantCard
              key={participant.userId || index}
              participant={participant}
              isHost={isHost}
              isCurrentUser={participant.isLocal}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ParticipantCard({ participant, isHost, isCurrentUser }) {
  const name = participant.name || participant.userName || 'Unknown';
  const isMuted = participant.is_muted || false;
  const isVideoOn = participant.is_video_on !== false;
  const isHandRaised = participant.is_hand_raised || false;
  const isScreenSharing = participant.is_screen_sharing || false;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gray-800 rounded-lg p-3 hover:bg-gray-750 transition-colors"
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium flex-shrink-0">
          {name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white text-sm font-medium truncate">
              {name}
            </p>
            {isCurrentUser && (
              <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                You
              </span>
            )}
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-2 mt-1">
            {isMuted && (
              <span className="text-red-400 text-xs" title="Muted">
                🔇 Muted
              </span>
            )}
            {!isVideoOn && (
              <span className="text-gray-400 text-xs" title="Video Off">
                📹 Off
              </span>
            )}
            {isScreenSharing && (
              <span className="text-blue-400 text-xs" title="Screen Sharing">
                🖥️ Sharing
              </span>
            )}
          </div>
        </div>

        {/* Hand Raised */}
        {isHandRaised && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-2xl"
            title="Hand Raised"
          >
            ✋
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
