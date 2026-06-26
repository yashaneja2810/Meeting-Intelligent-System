import { motion } from 'framer-motion';

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
  onToggleSidebar
}) {
  const ControlButton = ({ icon, label, active, onClick, color = 'gray', disabled = false }) => (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-1 px-4 py-3 rounded-lg transition-colors ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : active
          ? color === 'red'
            ? 'bg-red-600 hover:bg-red-700'
            : color === 'green'
            ? 'bg-green-600 hover:bg-green-700'
            : color === 'blue'
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-white hover:bg-gray-100'
          : 'bg-gray-700 hover:bg-gray-600'
      }`}
      title={label}
    >
      <span className={`text-2xl ${active && color !== 'gray' ? 'text-white' : active ? 'text-black' : 'text-white'}`}>
        {icon}
      </span>
      <span className={`text-xs font-medium ${active && color !== 'gray' ? 'text-white' : active ? 'text-black' : 'text-white'}`}>
        {label}
      </span>
    </motion.button>
  );

  return (
    <div className="bg-gray-900 border-t border-gray-800 px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-3">
        {/* Mute/Unmute */}
        <ControlButton
          icon={isMuted ? '🔇' : '🎤'}
          label={isMuted ? 'Unmute' : 'Mute'}
          active={!isMuted}
          onClick={onToggleMute}
        />

        {/* Video On/Off */}
        <ControlButton
          icon={isVideoOn ? '📹' : '🚫'}
          label={isVideoOn ? 'Stop Video' : 'Start Video'}
          active={isVideoOn}
          onClick={onToggleVideo}
        />

        {/* Screen Share */}
        <ControlButton
          icon={isScreenSharing ? '🖥️' : '📱'}
          label={isScreenSharing ? 'Stop Share' : 'Share Screen'}
          active={isScreenSharing}
          onClick={onToggleScreenShare}
          color={isScreenSharing ? 'blue' : 'gray'}
        />

        {/* Hand Raise */}
        <ControlButton
          icon={isHandRaised ? '✋' : '🙌'}
          label={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
          active={isHandRaised}
          onClick={onToggleHandRaise}
          color={isHandRaised ? 'green' : 'gray'}
        />

        {/* Sidebar Toggle */}
        <ControlButton
          icon={showSidebar ? '→' : '←'}
          label={showSidebar ? 'Hide' : 'Show'}
          active={showSidebar}
          onClick={onToggleSidebar}
        />

        {/* Spacer */}
        <div className="w-8"></div>

        {/* Leave Meeting */}
        <ControlButton
          icon="📞"
          label="Leave"
          active={true}
          onClick={onLeaveMeeting}
          color="red"
        />
      </div>
    </div>
  );
}
