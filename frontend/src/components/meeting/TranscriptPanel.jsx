import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

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
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-white font-semibold">
          Transcript ({segments.length})
        </h3>
        {segments.length > 0 && (
          <button
            onClick={handleExport}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Export
          </button>
        )}
      </div>

      {/* Transcript */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {segments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-4xl mb-2">📝</p>
            <p className="text-sm">No transcript yet</p>
            <p className="text-xs mt-1">
              Transcription will appear here when available
            </p>
          </div>
        ) : (
          <>
            {segments.map((segment, index) => (
              <TranscriptSegment
                key={segment.id || index}
                segment={segment}
                formatTime={formatTime}
              />
            ))}
            <div ref={transcriptEndRef} />
          </>
        )}
      </div>
    </div>
  );
}

function TranscriptSegment({ segment, formatTime }) {
  const confidence = segment.confidence || 0;
  const confidenceColor = 
    confidence > 0.8 ? 'text-green-400' :
    confidence > 0.6 ? 'text-yellow-400' :
    'text-red-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">
            {segment.speaker_name}
          </span>
          {segment.language && segment.language !== 'en' && (
            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded">
              {segment.language.toUpperCase()}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {confidence > 0 && (
            <span className={`text-xs ${confidenceColor}`} title={`Confidence: ${Math.round(confidence * 100)}%`}>
              {Math.round(confidence * 100)}%
            </span>
          )}
          <span className="text-xs text-gray-500">
            {formatTime(segment.start_time)}
          </span>
        </div>
      </div>

      {/* Text */}
      <p className="text-gray-300 text-sm leading-relaxed">
        {segment.text}
      </p>

      {/* Final indicator */}
      {!segment.is_final && (
        <p className="text-xs text-yellow-400 mt-1">
          ⏳ Interim result
        </p>
      )}
    </motion.div>
  );
}
