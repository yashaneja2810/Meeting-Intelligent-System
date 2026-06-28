import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// SVG Icons
const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// Speaker color palette for left-border coding
const getSpeakerColor = (name) => {
  const colors = [
    '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#14B8A6'
  ];
  const hash = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export default function TranscriptPanel({ segments, meetingId }) {
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [segments]);

  const scrollToBottom = () => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExport = () => {
    const text = segments
      .map(s => `[${s.speaker_name}]: ${s.text}`)
      .join('\n\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-transcript-${meetingId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col" style={{ background: '#0d0d0d' }}>
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-semibold text-sm">Transcript</h3>
          <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full font-medium">
            {segments.length}
          </span>
        </div>
        {segments.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors p-1.5 rounded-lg hover:bg-white/5"
            title="Export transcript"
          >
            <DownloadIcon />
          </motion.button>
        )}
      </div>

      {/* Transcript */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {segments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <p className="text-white/30 text-sm">No transcript yet</p>
            <p className="text-white/15 text-xs mt-1">
              Start recording to enable transcription
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {segments.map((segment, index) => (
              <TranscriptSegment
                key={segment.id || index}
                segment={segment}
                formatTime={formatTime}
              />
            ))}
            <div ref={transcriptEndRef} />
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function TranscriptSegment({ segment, formatTime }) {
  const confidence = segment.confidence || 0;
  const speakerColor = getSpeakerColor(segment.speaker_name);
  const isInterim = !segment.is_final;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`rounded-xl p-3 ${isInterim ? 'interim-text' : ''}`}
      style={{
        background: '#141414',
        borderLeft: `3px solid ${speakerColor}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: speakerColor }}>
            {segment.speaker_name}
          </span>
          {segment.language && segment.language !== 'en' && (
            <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded font-medium uppercase">
              {segment.language}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Confidence Bar */}
          {confidence > 0 && (
            <div className="flex items-center gap-1.5" title={`Confidence: ${Math.round(confidence * 100)}%`}>
              <div className="w-12 h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${confidence * 100}%`,
                    background: confidence > 0.8 ? '#22c55e' : confidence > 0.6 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
            </div>
          )}
          <span className="text-[10px] text-white/25 font-mono">
            {formatTime(segment.start_time)}
          </span>
        </div>
      </div>

      {/* Text */}
      <p className={`text-sm leading-relaxed ${isInterim ? 'text-white/40 italic' : 'text-white/75'}`}>
        {segment.text}
      </p>

      {/* Interim indicator */}
      {isInterim && (
        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex gap-0.5">
            <span className="typing-dot w-1 h-1 rounded-full bg-amber-400/60" />
            <span className="typing-dot w-1 h-1 rounded-full bg-amber-400/60" />
            <span className="typing-dot w-1 h-1 rounded-full bg-amber-400/60" />
          </div>
          <span className="text-[10px] text-amber-400/50">Processing...</span>
        </div>
      )}
    </motion.div>
  );
}
