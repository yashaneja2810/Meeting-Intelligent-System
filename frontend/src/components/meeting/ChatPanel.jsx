import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ChatPanel({ messages, participants, currentUser, onSendMessage }) {
  const [messageText, setMessageText] = useState('');
  const [recipientId, setRecipientId] = useState(null); // null = public, userId = private
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
    <div className="h-full flex flex-col bg-gray-900">
      {/* Recipient Selector */}
      <div className="p-3 border-b border-gray-800">
        <select
          value={recipientId || ''}
          onChange={(e) => setRecipientId(e.target.value || null)}
          className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Everyone (Public)</option>
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
          <div className="text-center text-gray-500 py-8">
            <p className="text-4xl mb-2">💬</p>
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isMyMessage={isMyMessage(message)}
              formatTime={formatTime}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={recipientId ? "Send private message..." : "Send message to everyone..."}
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={!messageText.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Send
          </button>
        </div>
        {recipientId && (
          <p className="text-xs text-yellow-400 mt-1">
            🔒 Private message
          </p>
        )}
      </form>
    </div>
  );
}

function MessageBubble({ message, isMyMessage, formatTime }) {
  const isPrivate = message.is_private;
  const isSystem = message.message_type === 'system';

  if (isSystem) {
    return (
      <div className="text-center">
        <p className="text-gray-500 text-xs">{message.message}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-xs ${isMyMessage ? 'text-right' : 'text-left'}`}>
        {/* Sender Name */}
        <div className="flex items-center gap-2 mb-1">
          {!isMyMessage && (
            <span className="text-xs text-gray-400 font-medium">
              {message.sender_name}
            </span>
          )}
          {isPrivate && (
            <span className="text-xs text-yellow-400" title="Private message">
              🔒
            </span>
          )}
          {isMyMessage && (
            <span className="text-xs text-gray-400 font-medium">
              You
            </span>
          )}
        </div>

        {/* Message Bubble */}
        <div
          className={`inline-block rounded-lg px-4 py-2 ${
            isMyMessage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-white'
          }`}
        >
          <p className="text-sm break-words">{message.message}</p>
        </div>

        {/* Timestamp */}
        <p className="text-xs text-gray-500 mt-1">
          {formatTime(message.created_at)}
        </p>
      </div>
    </motion.div>
  );
}
