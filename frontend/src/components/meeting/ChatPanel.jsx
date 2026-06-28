import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// SVG Icons
const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// Generate consistent color from name
const getAvatarColor = (name) => {
  const colors = [
    '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#14B8A6'
  ];
  const hash = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export default function ChatPanel({ messages, participants, currentUser, onSendMessage }) {
  const [messageText, setMessageText] = useState('');
  const [recipientId, setRecipientId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    onSendMessage(messageText, recipientId, !!recipientId);
    setMessageText('');
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isMyMessage = (message) => {
    return message.sender_id === currentUser?.participantId;
  };

  return (
    <div className="h-full flex flex-col" style={{ background: '#0d0d0d' }}>
      {/* Recipient Selector */}
      <div className="p-3 border-b border-white/5">
        <select
          value={recipientId || ''}
          onChange={(e) => setRecipientId(e.target.value || null)}
          className="w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
          style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <option value="">Everyone</option>
          <optgroup label="Direct Message">
            {participants.map(p => (
              <option key={p.userId} value={p.participantId}>
                {p.userName} (Private)
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-white/30 text-sm">No messages yet</p>
            <p className="text-white/15 text-xs mt-1">Start the conversation</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isMyMessage={isMyMessage(message)}
                formatTime={formatTime}
              />
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-white/5">
        {recipientId && (
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <span className="text-amber-400/70"><LockIcon /></span>
            <span className="text-xs text-amber-400/70 font-medium">Private message</span>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={recipientId ? "Private message..." : "Type a message..."}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
            style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)' }}
            maxLength={2000}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!messageText.trim()}
            className="px-3.5 py-2.5 rounded-xl text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            style={{ background: messageText.trim() ? '#ffffff' : 'rgba(255,255,255,0.06)' }}
          >
            <span style={{ color: messageText.trim() ? '#000' : 'rgba(255,255,255,0.3)' }}>
              <SendIcon />
            </span>
          </motion.button>
        </div>
      </form>
    </div>
  );
}

function MessageBubble({ message, isMyMessage, formatTime }) {
  const isPrivate = message.is_private;
  const isSystem = message.message_type === 'system';

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-1"
      >
        <span className="text-white/20 text-xs px-3 py-1 rounded-full bg-white/5 inline-block">
          {message.message}
        </span>
      </motion.div>
    );
  }

  const avatarColor = getAvatarColor(message.sender_name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[80%] ${isMyMessage ? 'text-right' : 'text-left'}`}>
        {/* Sender */}
        <div className={`flex items-center gap-1.5 mb-1 ${isMyMessage ? 'justify-end' : ''}`}>
          {!isMyMessage && (
            <>
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: avatarColor }}
              />
              <span className="text-xs font-medium" style={{ color: avatarColor }}>
                {message.sender_name}
              </span>
            </>
          )}
          {isMyMessage && (
            <span className="text-xs text-white/40 font-medium">You</span>
          )}
          {isPrivate && (
            <span className="text-amber-400/60"><LockIcon /></span>
          )}
        </div>

        {/* Bubble */}
        <div
          className={`inline-block rounded-2xl px-4 py-2.5 ${
            isMyMessage
              ? 'rounded-br-md'
              : 'rounded-bl-md'
          }`}
          style={{
            background: isMyMessage ? 'rgba(255,255,255,0.12)' : '#1a1a1a',
          }}
        >
          <p className="text-sm text-white/90 leading-relaxed break-words">
            {message.message}
          </p>
        </div>

        {/* Timestamp */}
        <p className="text-[10px] text-white/20 mt-1 px-1">
          {formatTime(message.created_at)}
        </p>
      </div>
    </motion.div>
  );
}
