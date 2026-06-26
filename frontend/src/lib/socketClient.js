import { io } from 'socket.io-client';

class SocketClient {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token, meetingId, userId) {
    return new Promise((resolve, reject) => {
      // Prevent duplicate connections
      if (this.socket && this.socket.connected) {
        console.log('⚠️ Socket already connected, reusing connection');
        resolve({ participantId: 'existing', participants: [], isHost: false });
        return;
      }

      const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      // Handle connection
      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id);
        
        // Register all pending event listeners
        for (const [event, callbacks] of this.listeners.entries()) {
          if (callbacks.length > 0) {
            this.socket.on(event, (data) => {
              this.emit(event, data);
            });
            console.log(`📡 Registered listener for event: ${event}`);
          }
        }
        
        // Authenticate
        this.socket.emit('authenticate', { token, meetingId, userId });
      });

      // Handle authentication
      this.socket.on('auth-success', (data) => {
        console.log('✅ Socket authenticated:', data);
        // Emit to listeners
        this.emit('auth-success', data);
        // Also resolve the promise
        resolve(data);
      });

      this.socket.on('auth-error', (error) => {
        console.error('Socket auth error:', error);
        reject(error);
      });

      // Handle disconnection
      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.emit('disconnected', reason);
      });

      // Handle reconnection
      this.socket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
        this.emit('reconnected', attemptNumber);
      });

      // Handle errors
      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
        this.emit('error', error);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  // Event emitter methods
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event).push(callback);
    
    // Register with socket if it exists
    if (this.socket) {
      // Remove any existing listener to avoid duplicates
      this.socket.off(event);
      this.socket.on(event, (data) => {
        this.emit(event, data);
      });
    }
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      
      if (callbacks.length === 0) {
        this.listeners.delete(event);
        if (this.socket) {
          this.socket.off(event);
        }
      }
    }
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  // WebRTC Signaling
  sendOffer(targetUserId, offer) {
    if (this.socket) {
      this.socket.emit('webrtc-offer', { targetUserId, offer });
    }
  }

  sendAnswer(targetUserId, answer) {
    if (this.socket) {
      this.socket.emit('webrtc-answer', { targetUserId, answer });
    }
  }

  sendIceCandidate(targetUserId, candidate) {
    if (this.socket) {
      this.socket.emit('ice-candidate', { targetUserId, candidate });
    }
  }

  // Chat
  sendChatMessage(message, recipientId = null, isPrivate = false) {
    if (this.socket) {
      this.socket.emit('chat-message', { message, recipientId, isPrivate });
    }
  }

  // Hand Raise
  raiseHand(isRaised) {
    if (this.socket) {
      this.socket.emit('hand-raise', { isRaised });
    }
  }

  // Polls
  createPoll(question, options, allowMultiple = false, anonymous = false) {
    if (this.socket) {
      this.socket.emit('create-poll', { question, options, allowMultiple, anonymous });
    }
  }

  votePoll(pollId, optionIds) {
    if (this.socket) {
      this.socket.emit('poll-vote', { pollId, optionIds });
    }
  }

  closePoll(pollId) {
    if (this.socket) {
      this.socket.emit('close-poll', { pollId });
    }
  }

  // Transcription
  sendTranscriptSegment(segment) {
    if (this.socket) {
      this.socket.emit('transcript-segment', segment);
    }
  }

  // Media state
  updateMediaState(state) {
    if (this.socket) {
      this.socket.emit('media-state-change', state);
    }
  }
}

// Singleton instance
const socketClient = new SocketClient();

export default socketClient;
