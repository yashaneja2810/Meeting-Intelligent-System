import { Server } from 'socket.io';
import { supabase, supabaseAdmin } from '../config/supabase.js';

let io = null;

// Meeting room state management
const meetingRooms = new Map(); // meetingId -> { participants: Map(userId -> socketId), state: {} }

export function initializeSocketIO(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Handle authentication
    socket.on('authenticate', async (data) => {
      try {
        const { token, meetingId, userId } = data;
        
        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
          socket.emit('auth-error', { message: 'Invalid authentication token' });
          socket.disconnect();
          return;
        }

        // Get meeting details
        const { data: meeting, error: meetingError } = await supabaseAdmin
          .from('live_meetings')
          .select('*')
          .eq('id', meetingId)
          .single();

        if (meetingError || !meeting) {
          socket.emit('auth-error', { message: 'Meeting not found' });
          socket.disconnect();
          return;
        }

        // Check if user is the host (meeting creator)
        const isHost = meeting.user_id === user.id;

        if (isHost) {
          // Host can always join - create/get participant record for host
          socket.userId = userId;
          socket.meetingId = meetingId;
          socket.userName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Host';
          socket.isHost = true;

          // Get or create a special team member record for the host
          let hostTeamMember = null;
          const { data: existingTeamMember, error: existingTeamMemberError } = await supabaseAdmin
            .from('team_members')
            .select('*')
            .eq('user_id', user.id)
            .eq('email', user.email)
            .maybeSingle();

          if (existingTeamMemberError) {
            console.error('Error looking up host team member:', existingTeamMemberError);
          }

          if (existingTeamMember) {
            hostTeamMember = existingTeamMember;
          } else {
            // Create a team member record for the host
            const { data: newTeamMember, error: createError } = await supabaseAdmin
              .from('team_members')
              .insert({
                user_id: user.id,
                name: socket.userName,
                email: user.email,
                role: 'admin',
                is_active: true
              })
              .select()
              .single();

            if (createError) {
              console.error('Error creating host team member:', createError);
              hostTeamMember = null;
            } else {
              hostTeamMember = newTeamMember;
            }
          }

          // Create participant record for the host
          if (hostTeamMember) {
            const { data: existingParticipant, error: existingParticipantError } = await supabaseAdmin
              .from('meeting_participants')
              .select('*')
              .eq('meeting_id', meetingId)
              .eq('team_member_id', hostTeamMember.id)
              .maybeSingle();

            if (existingParticipantError) {
              console.error('Error looking up host participant:', existingParticipantError);
            }

            if (existingParticipant) {
              // Participant already exists for this host
              socket.participantId = existingParticipant.id;
            } else {
              // Create new participant record for the host
              const { data: newParticipant, error: participantError } = await supabaseAdmin
                .from('meeting_participants')
                .insert({
                  meeting_id: meetingId,
                  team_member_id: hostTeamMember.id,
                  user_id: user.id,
                  status: 'joined'
                })
                .select()
                .single();

              if (participantError) {
                console.error('Error creating host participant:', participantError);
                socket.emit('auth-error', { message: 'Failed to create participant record' });
                socket.disconnect();
                return;
              } else {
                socket.participantId = newParticipant.id;
              }
            }
          } else {
            socket.emit('auth-error', { message: 'Failed to create host team member' });
            socket.disconnect();
            return;
          }

          console.log('✅ Host authenticated:', socket.userName, 'participantId:', socket.participantId);
        } else {
          // For team members, userId might be either team_member_id or user.id
          // Try to find team member by ID first, then by email
          let participant = null;
          let teamMember = null;

          // Try finding by team_member_id
          const { data: participantByTeamMemberId } = await supabaseAdmin
            .from('meeting_participants')
            .select(`
              *,
              team_member:team_members(*)
            `)
            .eq('meeting_id', meetingId)
            .eq('team_member_id', userId)
            .single();

          if (participantByTeamMemberId) {
            participant = participantByTeamMemberId;
            teamMember = participant.team_member;
          } else {
            // Try finding by user email
            const { data: teamMembers } = await supabaseAdmin
              .from('team_members')
              .select('*')
              .eq('email', user.email);

            if (teamMembers && teamMembers.length > 0) {
              teamMember = teamMembers[0];
              
              // Find participant record
              const { data: participantByEmail } = await supabaseAdmin
                .from('meeting_participants')
                .select('*')
                .eq('meeting_id', meetingId)
                .eq('team_member_id', teamMember.id)
                .single();

              participant = participantByEmail;
            }
          }

          if (!participant || !teamMember) {
            socket.emit('auth-error', { message: 'Unauthorized access to meeting' });
            socket.disconnect();
            return;
          }

          // Store participant info
          socket.userId = teamMember.id; // Use team_member.id as userId
          socket.meetingId = meetingId;
          socket.participantId = participant.id;
          socket.userName = teamMember.name;
          socket.isHost = false;

          // Update participant connection info
          await supabaseAdmin
            .from('meeting_participants')
            .update({
              socket_id: socket.id,
              status: 'joined',
              joined_at: new Date().toISOString()
            })
            .eq('id', participant.id);
        }

        // Join meeting room
        socket.join(meetingId);

        // Initialize room if needed
        if (!meetingRooms.has(meetingId)) {
          meetingRooms.set(meetingId, {
            participants: new Map(),
            state: {}
          });
        }

        const room = meetingRooms.get(meetingId);
        room.participants.set(socket.userId, socket.id);

        // Get all current participants
        const { data: allParticipants } = await supabaseAdmin
          .from('meeting_participants')
          .select('*, team_member:team_members(*)')
          .eq('meeting_id', meetingId)
          .eq('status', 'joined');

        socket.emit('auth-success', { 
          participantId: socket.participantId,
          participants: allParticipants || [],
          isHost: socket.isHost
        });

        // Notify others that this user joined
        // Each recipient gets a deterministic initiator role for this pair.
        for (const [existingUserId, existingSocketId] of room.participants.entries()) {
          if (existingUserId === socket.userId) {
            continue;
          }

          io.to(existingSocketId).emit('participant-joined', {
            participantId: socket.participantId,
            userId: socket.userId,
            userName: socket.userName,
            isHost: socket.isHost,
            shouldInitiate: existingUserId > socket.userId,
            timestamp: new Date().toISOString()
          });
        }

        console.log('✅ User authenticated:', socket.userName, 'userId:', socket.userId, 'isHost:', socket.isHost);

        // Tell this new user about ALL existing participants in the room
        // This allows them to create peer connections to existing users
        const existingUsers = Array.from(room.participants.entries())
          .filter(([existingUserId, socketId]) => existingUserId !== socket.userId);
        
        console.log('📢 Notifying new user about', existingUsers.length, 'existing participants');
        
        for (const [existingUserId, existingSocketId] of existingUsers) {
          const existingSocket = io.sockets.sockets.get(existingSocketId);
          if (existingSocket) {
            socket.emit('participant-joined', {
              participantId: existingSocket.participantId,
              userId: existingUserId,
              userName: existingSocket.userName,
              isHost: existingSocket.isHost || false,
              shouldInitiate: socket.userId > existingUserId,
              timestamp: new Date().toISOString()
            });
            console.log('  ↪️ Sent participant-joined for:', existingSocket.userName);
          }
        }

      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('auth-error', { message: 'Authentication failed' });
        socket.disconnect();
      }
    });

    // WebRTC Signaling
    socket.on('webrtc-offer', async (data) => {
      const { targetUserId, offer } = data;
      const room = meetingRooms.get(socket.meetingId);
      
      if (room && room.participants.has(targetUserId)) {
        const targetSocketId = room.participants.get(targetUserId);
        io.to(targetSocketId).emit('webrtc-offer', {
          fromUserId: socket.userId,
          fromUserName: socket.userName,
          offer
        });
      }
    });

    socket.on('webrtc-answer', async (data) => {
      const { targetUserId, answer } = data;
      const room = meetingRooms.get(socket.meetingId);
      
      if (room && room.participants.has(targetUserId)) {
        const targetSocketId = room.participants.get(targetUserId);
        io.to(targetSocketId).emit('webrtc-answer', {
          fromUserId: socket.userId,
          answer
        });
      }
    });

    socket.on('ice-candidate', async (data) => {
      const { targetUserId, candidate } = data;
      const room = meetingRooms.get(socket.meetingId);
      
      if (room && room.participants.has(targetUserId)) {
        const targetSocketId = room.participants.get(targetUserId);
        io.to(targetSocketId).emit('ice-candidate', {
          fromUserId: socket.userId,
          candidate
        });
      }
    });

    // Chat messages
    socket.on('chat-message', async (data) => {
      try {
        const { message, recipientId, isPrivate } = data;

        // Save to database
        const { data: chatMessage, error } = await supabaseAdmin
          .from('chat_messages')
          .insert({
            meeting_id: socket.meetingId,
            sender_id: socket.participantId,
            recipient_id: recipientId || null,
            message,
            is_private: isPrivate || false,
            sender_name: socket.userName
          })
          .select()
          .single();

        if (error) throw error;

        // Broadcast message
        if (isPrivate && recipientId) {
          // Send to recipient only
          const room = meetingRooms.get(socket.meetingId);
          if (room) {
            const { data: recipientParticipant } = await supabaseAdmin
              .from('meeting_participants')
              .select('team_member_id')
              .eq('id', recipientId)
              .single();
            
            if (recipientParticipant) {
              const recipientSocketId = room.participants.get(recipientParticipant.team_member_id);
              if (recipientSocketId) {
                io.to(recipientSocketId).emit('chat-message', chatMessage);
              }
            }
          }
          // Echo back to sender
          socket.emit('chat-message', chatMessage);
        } else {
          // Public message - broadcast to all
          io.to(socket.meetingId).emit('chat-message', chatMessage);
        }
      } catch (error) {
        console.error('Chat message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Hand raise
    socket.on('hand-raise', async (data) => {
      try {
        const { isRaised } = data;

        // Update database
        await supabaseAdmin
          .from('meeting_participants')
          .update({ is_hand_raised: isRaised })
          .eq('id', socket.participantId);

        // Broadcast to all
        io.to(socket.meetingId).emit('hand-raise-update', {
          participantId: socket.participantId,
          userId: socket.userId,
          userName: socket.userName,
          isRaised
        });
      } catch (error) {
        console.error('Hand raise error:', error);
      }
    });

    // Create poll
    socket.on('create-poll', async (data) => {
      try {
        const { question, options, allowMultiple, anonymous } = data;

        // Create poll
        const { data: poll, error: pollError } = await supabaseAdmin
          .from('polls')
          .insert({
            meeting_id: socket.meetingId,
            creator_id: socket.participantId,
            question,
            allow_multiple: allowMultiple || false,
            anonymous: anonymous || false
          })
          .select()
          .single();

        if (pollError) throw pollError;

        // Create poll options
        const optionInserts = options.map(opt => ({
          poll_id: poll.id,
          text: opt
        }));

        const { data: pollOptions, error: optionsError } = await supabaseAdmin
          .from('poll_options')
          .insert(optionInserts)
          .select();

        if (optionsError) throw optionsError;

        // Broadcast poll to all participants
        io.to(socket.meetingId).emit('poll-created', {
          ...poll,
          options: pollOptions,
          creator_name: socket.userName
        });
      } catch (error) {
        console.error('Create poll error:', error);
        socket.emit('error', { message: 'Failed to create poll' });
      }
    });

    // Poll vote
    socket.on('poll-vote', async (data) => {
      try {
        const { pollId, optionIds } = data;

        // Insert votes
        const voteInserts = (Array.isArray(optionIds) ? optionIds : [optionIds]).map(optionId => ({
          poll_option_id: optionId,
          voter_id: socket.participantId
        }));

        const { error } = await supabaseAdmin
          .from('poll_votes')
          .insert(voteInserts);

        if (error) {
          // Check if already voted
          if (error.code === '23505') {
            socket.emit('error', { message: 'You have already voted' });
            return;
          }
          throw error;
        }

        // Get updated poll with votes
        const { data: updatedPoll } = await supabaseAdmin
          .from('polls')
          .select(`
            *,
            options:poll_options(
              *,
              votes:poll_votes(count)
            )
          `)
          .eq('id', pollId)
          .single();

        // Broadcast updated poll
        io.to(socket.meetingId).emit('poll-updated', updatedPoll);
      } catch (error) {
        console.error('Poll vote error:', error);
        socket.emit('error', { message: 'Failed to vote' });
      }
    });

    // Close poll
    socket.on('close-poll', async (data) => {
      try {
        const { pollId } = data;

        // Verify creator
        const { data: poll } = await supabaseAdmin
          .from('polls')
          .select('creator_id')
          .eq('id', pollId)
          .single();

        if (poll.creator_id !== socket.participantId) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        // Close poll
        await supabaseAdmin
          .from('polls')
          .update({ is_active: false, closed_at: new Date().toISOString() })
          .eq('id', pollId);

        // Broadcast
        io.to(socket.meetingId).emit('poll-closed', { pollId });
      } catch (error) {
        console.error('Close poll error:', error);
      }
    });

    // Transcript segment
    socket.on('transcript-segment', async (data) => {
      try {
        const { text, language, confidence, start_time, end_time, is_final, speaker_id, speaker_name } = data;

        // Validate text
        if (!text || text.trim().length === 0) {
          console.warn('⚠️ Received empty transcript segment, ignoring');
          return;
        }

        console.log('📝 Saving transcript segment from', speaker_name, ':', text.substring(0, 50));

        // Save to database with proper field names
        const { data: segment, error } = await supabaseAdmin
          .from('transcript_segments')
          .insert({
            meeting_id: socket.meetingId,
            speaker_id: socket.participantId,
            speaker_name: speaker_name || socket.userName,
            text: text.trim(),
            language: language || 'en',
            confidence: confidence || 0.8,
            start_time: start_time || 0,
            end_time: end_time || (start_time || 0) + 1,
            is_final: is_final !== false
          })
          .select()
          .single();

        if (error) {
          console.error('Database error:', error);
          throw error;
        }

        console.log('✅ Transcript segment saved, broadcasting to all participants');

        // Broadcast to all participants (for real-time subtitles)
        // Include speaker name for proper multi-participant display
        io.to(socket.meetingId).emit('transcript-update', {
          ...segment,
          speaker_display_name: speaker_name || socket.userName
        });
      } catch (error) {
        console.error('Transcript segment error:', error);
        socket.emit('error', { message: 'Failed to save transcript' });
      }
    });

    // Media state changes
    socket.on('media-state-change', async (data) => {
      try {
        const { isMuted, isVideoOn, isScreenSharing } = data;

        // Update database
        const updateData = {};
        if (isMuted !== undefined) updateData.is_muted = isMuted;
        if (isVideoOn !== undefined) updateData.is_video_on = isVideoOn;
        if (isScreenSharing !== undefined) updateData.is_screen_sharing = isScreenSharing;

        await supabaseAdmin
          .from('meeting_participants')
          .update(updateData)
          .eq('id', socket.participantId);

        // Broadcast to all
        socket.to(socket.meetingId).emit('participant-media-update', {
          participantId: socket.participantId,
          userId: socket.userId,
          ...updateData
        });
      } catch (error) {
        console.error('Media state change error:', error);
      }
    });

    // Disconnect handling
    socket.on('disconnect', async () => {
      console.log('Socket disconnected:', socket.id);

      if (socket.meetingId && socket.userId) {
        const room = meetingRooms.get(socket.meetingId);
        if (room) {
          room.participants.delete(socket.userId);
          
          // If room is empty, clean up
          if (room.participants.size === 0) {
            meetingRooms.delete(socket.meetingId);
          }
        }

        // Update participant status
        if (socket.participantId) {
          await supabaseAdmin
            .from('meeting_participants')
            .update({
              status: 'left',
              left_at: new Date().toISOString(),
              socket_id: null
            })
            .eq('id', socket.participantId);

          // Notify others
          socket.to(socket.meetingId).emit('participant-left', {
            participantId: socket.participantId,
            userId: socket.userId,
            userName: socket.userName
          });
        }
      }
    });
  });

  console.log('Socket.IO server initialized');
  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}
