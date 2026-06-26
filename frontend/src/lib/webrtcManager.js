import SimplePeer from 'simple-peer';

class WebRTCManager {
  constructor(socketClient, currentUserId) {
    this.socketClient = socketClient;
    this.currentUserId = currentUserId; // Store current user ID to avoid self-connection
    this.localStream = null;
    this.screenStream = null;
    this.peers = new Map(); // userId -> SimplePeer instance
    this.remoteStreams = new Map(); // userId -> MediaStream
    this.listeners = new Map();
    this.pendingPeerCreations = new Map(); // userId -> promise
    
    // WebRTC configuration
    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // Add TURN servers for production
        // {
        //   urls: import.meta.env.VITE_TURN_SERVER_URL,
        //   username: import.meta.env.VITE_TURN_USERNAME,
        //   credential: import.meta.env.VITE_TURN_CREDENTIAL
        // }
      ]
    };
    
    this.setupSocketListeners();
  }

  setupSocketListeners() {
    // Handle incoming WebRTC offers
    this.socketClient.on('webrtc-offer', async ({ fromUserId, fromUserName, offer }) => {
      console.log('Received offer from:', fromUserName);
      await this.handleOffer(fromUserId, offer);
    });

    // Handle incoming WebRTC answers
    this.socketClient.on('webrtc-answer', async ({ fromUserId, answer }) => {
      console.log('Received answer from:', fromUserId);
      await this.handleAnswer(fromUserId, answer);
    });

    // Handle incoming ICE candidates
    this.socketClient.on('ice-candidate', async ({ fromUserId, candidate }) => {
      console.log('Received ICE candidate from:', fromUserId);
      await this.handleIceCandidate(fromUserId, candidate);
    });

    // Handle participant joined
    this.socketClient.on('participant-joined', async ({ userId, userName, participantId, shouldInitiate }) => {
      console.log('🔔 Participant joined:', userName, 'userId:', userId);
      
      // Don't create peer connection to ourselves
      if (this.currentUserId && userId === this.currentUserId) {
        console.log('⏩ Skipping peer connection to self');
        return;
      }
      
      // Create the peer using the deterministic role assigned by the server.
      if (!this.peers.has(userId)) {
        const initiator = Boolean(shouldInitiate);
        console.log('👉 Creating peer connection for:', userName, 'Initiator:', initiator);
        await this.createPeerConnection(userId, initiator);
      } else {
        console.log('⚠️ Peer connection already exists for:', userName);
      }
    });
  }

  async initializeLocalMedia(constraints = { video: true, audio: true }) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Local media initialized');
      this.emit('localStream', this.localStream);
      return this.localStream;
    } catch (error) {
      console.error('Error initializing local media:', error);
      throw error;
    }
  }

  async createPeerConnection(userId, initiator = false) {
    try {
      console.log('🔧 [WebRTC] Creating peer connection for:', userId, 'Initiator:', initiator);

      if (this.peers.has(userId)) {
        console.log('⚠️ [WebRTC] Peer connection already exists for:', userId);
        return;
      }

      if (!this.localStream) {
        console.error('❌ [WebRTC] No local stream available! Cannot create peer connection');
        throw new Error('Local stream not initialized');
      }

      console.log('✅ [WebRTC] Local stream available with', this.localStream.getTracks().length, 'tracks');
      console.log('📹 [WebRTC] Video tracks:', this.localStream.getVideoTracks().length);
      console.log('🎤 [WebRTC] Audio tracks:', this.localStream.getAudioTracks().length);

      const peer = new SimplePeer({
        initiator,
        stream: this.localStream,
        config: this.config,
        trickle: true
      });
      peer._roleInitiator = initiator;

      console.log('✅ [WebRTC] SimplePeer instance created for:', userId);

      // Handle signaling
      peer.on('signal', (signal) => {
        console.log('📡 [WebRTC] Signal event:', signal.type, 'for user:', userId);
        if (signal.type === 'offer') {
          console.log('📤 [WebRTC] Sending offer to:', userId);
          this.socketClient.sendOffer(userId, signal);
        } else if (signal.type === 'answer') {
          console.log('📤 [WebRTC] Sending answer to:', userId);
          this.socketClient.sendAnswer(userId, signal);
        } else {
          console.log('📤 [WebRTC] Sending ICE candidate to:', userId);
          this.socketClient.sendIceCandidate(userId, signal);
        }
      });

      peer.on('stream', (remoteStream) => {
        console.log('📺 [WebRTC] Received remote stream from:', userId);
        console.log('    Remote stream tracks:', remoteStream.getTracks().length);
        this.remoteStreams.set(userId, remoteStream);
        this.emit('remoteStream', { userId, stream: remoteStream });
      });

      peer.on('connect', () => {
        console.log('✅ [WebRTC] Peer connected:', userId);
        this.emit('peerConnected', userId);
      });

      peer.on('close', () => {
        console.log('🔌 [WebRTC] Peer connection closed:', userId);
        if (!peer._intentionallyDestroyed) {
          this.removePeerConnection(userId);
        } else {
          console.log('⏩ [WebRTC] Skipping auto-removal (intentional destroy)');
        }
      });

      peer.on('error', (error) => {
        console.error('❌ [WebRTC] Peer error:', userId, error.message || error);

        if (error.message && (
          error.message.includes('wrong state') ||
          error.message.includes('setRemoteDescription') ||
          error.message.includes('remote answer sdp')
        )) {
          console.log('⚠️ [WebRTC] Ignoring stale signaling-state error for:', userId);
          return;
        }

        this.emit('peerError', { userId, error });
      });

      this.peers.set(userId, peer);
      console.log('Created peer connection for:', userId);
    } catch (error) {
      console.error('Error creating peer connection:', error);
      throw error;
    }
  }

  async handleOffer(userId, offer) {
    console.log('📥 [WebRTC] Handling offer from:', userId);
    
    // If a peer already exists, reuse it instead of destroying/recreating.
    // Destroy/recreate can race with simple-peer's internal stream events.
    if (!this.peers.has(userId)) {
      console.log('🆕 [WebRTC] Creating fresh non-initiator peer');
      if (!this.pendingPeerCreations.has(userId)) {
        this.pendingPeerCreations.set(
          userId,
          this.createPeerConnection(userId, false).finally(() => {
            this.pendingPeerCreations.delete(userId);
          })
        );
      }

      await this.pendingPeerCreations.get(userId);
    }

    const peer = this.peers.get(userId);
    if (peer) {
      if (peer._roleInitiator) {
        console.log('⏩ [WebRTC] Ignoring offer on initiator-side peer:', userId);
        return;
      }

      console.log('📨 [WebRTC] Signaling offer to peer');
      try {
        peer.signal(offer);
      } catch (error) {
        console.error('❌ [WebRTC] Failed to signal offer:', error.message || error);
      }
    }
  }

  async handleAnswer(userId, answer) {
    const peer = this.peers.get(userId);
    if (peer) {
      peer.signal(answer);
    }
  }

  async handleIceCandidate(userId, candidate) {
    const peer = this.peers.get(userId);
    if (peer) {
      peer.signal(candidate);
    }
  }

  removePeerConnection(userId) {
    const peer = this.peers.get(userId);
    if (peer) {
      // Set flag to prevent close event from triggering removal again
      peer._intentionallyDestroyed = true;
      try {
        peer.removeAllListeners?.();
      } catch (error) {
        console.log('⚠️ [WebRTC] Failed to remove peer listeners:', error.message || error);
      }
      try {
        peer.destroy();
      } catch (error) {
        console.log('⚠️ [WebRTC] Peer destroy failed:', error.message || error);
      }
      this.peers.delete(userId);
    }
    
    const stream = this.remoteStreams.get(userId);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      this.remoteStreams.delete(userId);
    }
    
    this.emit('peerDisconnected', userId);
  }

  toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
      this.socketClient.updateMediaState({ isMuted: !enabled });
      return enabled;
    }
    return false;
  }

  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
      this.socketClient.updateMediaState({ isVideoOn: enabled });
      return enabled;
    }
    return false;
  }

  async startScreenShare() {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always'
        },
        audio: false
      });

      // Replace video track for all peers
      const screenTrack = this.screenStream.getVideoTracks()[0];
      
      this.peers.forEach(peer => {
        const sender = peer._pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
      });

      // Handle screen share stop
      screenTrack.onended = () => {
        this.stopScreenShare();
      };

      this.socketClient.updateMediaState({ isScreenSharing: true });
      this.emit('screenShareStarted', this.screenStream);
      
      return this.screenStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }

  async stopScreenShare() {
    if (this.screenStream) {
      // Stop screen share tracks
      this.screenStream.getTracks().forEach(track => track.stop());
      
      // Restore camera video track for all peers
      if (this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        
        this.peers.forEach(peer => {
          const sender = peer._pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });
      }
      
      this.screenStream = null;
      this.socketClient.updateMediaState({ isScreenSharing: false });
      this.emit('screenShareStopped');
    }
  }

  stopLocalMedia() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }
  }

  destroy() {
    // Close all peer connections
    this.peers.forEach((peer, userId) => {
      this.removePeerConnection(userId);
    });

    this.pendingPeerCreations.clear();
    
    // Stop local media
    this.stopLocalMedia();
    
    // Clear listeners
    this.listeners.clear();
    
    console.log('WebRTC Manager destroyed');
  }

  // Event emitter methods
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  getLocalStream() {
    return this.localStream;
  }

  getRemoteStreams() {
    return this.remoteStreams;
  }

  getPeers() {
    return this.peers;
  }
}

export default WebRTCManager;
