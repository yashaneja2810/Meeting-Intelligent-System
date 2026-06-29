import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
// import nodemailer from 'nodemailer';
import * as brevo from '@getbrevo/brevo';
import axios from 'axios';

const router = express.Router();

// Create a new live meeting
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      title,
      description,
      scheduledAt,
      meetingType,
      participantIds, // Array of team_member IDs
      transcriptLanguage,
      maxParticipants
    } = req.body;

    const userId = req.user.id;

    // Validation
    if (!title || !participantIds || participantIds.length === 0) {
      return res.status(400).json({
        error: 'Title and at least one participant required'
      });
    }

    if (participantIds.length > (maxParticipants || 5)) {
      return res.status(400).json({
        error: `Maximum ${maxParticipants || 5} participants allowed`
      });
    }

    // Create meeting
    const { data: meeting, error: meetingError } = await supabaseAdmin
      .from('live_meetings')
      .insert({
        user_id: userId,
        title,
        description,
        scheduled_at: scheduledAt || null,
        meeting_type: meetingType || 'instant',
        max_participants: maxParticipants || 5,
        transcript_language: transcriptLanguage || 'en',
        status: scheduledAt ? 'scheduled' : 'scheduled' // Will be activated when admin joins
      })
      .select()
      .single();

    if (meetingError) throw meetingError;

    // Add participants
    const participantInserts = participantIds.map(teamMemberId => ({
      meeting_id: meeting.id,
      team_member_id: teamMemberId,
      status: 'invited'
    }));

    const { data: participants, error: participantsError } = await supabaseAdmin
      .from('meeting_participants')
      .insert(participantInserts)
      .select('*, team_member:team_members(*)');

    if (participantsError) throw participantsError;

    // Send email invitations
    for (const participant of participants) {
      const teamMember = participant.team_member;
      
      // Send email notification
      await sendMeetingInvitation(
        teamMember.email,
        teamMember.name,
        meeting,
        userId
      );
    }

    res.status(201).json({
      meeting,
      participants
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
});

// Get all meetings for user (as admin or participant)
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, type } = req.query;

    // Get meetings where user is creator
    let query = supabaseAdmin
      .from('live_meetings')
      .select(`
        *,
        participants:meeting_participants(
          *,
          team_member:team_members(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('meeting_type', type);
    }

    const { data: ownMeetings, error: ownError } = await query;
    if (ownError) throw ownError;

    // Get meetings where user is participant
    // Look up team members by email (team member might have different user_id than the record)
    console.log('🔍 Looking up team members for logged-in user:', req.user.email, 'user_id:', userId);
    
    const { data: teamMembers } = await supabaseAdmin
      .from('team_members')
      .select('id, email, name')
      .eq('email', req.user.email);

    const teamMemberIds = teamMembers?.map(tm => tm.id) || [];

    console.log('✅ Found team_member records:', teamMembers?.length || 0, 'IDs:', teamMemberIds);

    let participantMeetings = [];
    if (teamMemberIds.length > 0) {
      const { data: meetings, error: partError } = await supabaseAdmin
        .from('meeting_participants')
        .select(`
          meeting:live_meetings(
            *,
            creator:users(display_name, email),
            participants:meeting_participants(
              *,
              team_member:team_members(*)
            )
          )
        `)
        .in('team_member_id', teamMemberIds);

      if (partError) {
        console.error('Error fetching participating meetings:', partError);
      } else {
        participantMeetings = meetings?.map(p => p.meeting).filter(Boolean) || [];
        console.log('✅ Found', participantMeetings.length, 'participating meetings');
      }
    }

    res.json({
      ownMeetings: ownMeetings || [],
      participatingMeetings: participantMeetings || []
    });
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch meetings',
      ownMeetings: [],
      participatingMeetings: []
    });
  }
});

// Get single meeting details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: meeting, error } = await supabaseAdmin
      .from('live_meetings')
      .select(`
        *,
        participants:meeting_participants(
          *,
          team_member:team_members(*)
        ),
        creator:users(display_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Verify access (creator or participant)
    const isCreator = meeting.user_id === userId;
    
    // Check if user is a participant by matching their email with team_member emails
    const { data: teamMembers } = await supabaseAdmin
      .from('team_members')
      .select('id')
      .eq('email', req.user.email);
    
    const teamMemberIds = teamMembers?.map(tm => tm.id) || [];
    const isParticipant = meeting.participants.some(p => 
      teamMemberIds.includes(p.team_member_id)
    );

    if (!isCreator && !isParticipant) {
      console.log('Access denied for user:', req.user.email, 'isCreator:', isCreator, 'isParticipant:', isParticipant);
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    res.json(meeting);
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(500).json({ error: 'Failed to fetch meeting' });
  }
});

// Start a meeting (change status to active)
router.post('/:id/start', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify meeting ownership
    const { data: meeting, error: checkError } = await supabaseAdmin
      .from('live_meetings')
      .select('user_id, status')
      .eq('id', id)
      .single();

    if (checkError) throw checkError;

    if (meeting.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (meeting.status === 'active') {
      return res.status(400).json({ error: 'Meeting already active' });
    }

    // Update meeting status
    const { data: updatedMeeting, error: updateError } = await supabaseAdmin
      .from('live_meetings')
      .update({
        status: 'active',
        started_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json(updatedMeeting);
  } catch (error) {
    console.error('Start meeting error:', error);
    res.status(500).json({ error: 'Failed to start meeting' });
  }
});

// End a meeting
router.post('/:id/end', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify meeting ownership
    const { data: meeting, error: checkError } = await supabaseAdmin
      .from('live_meetings')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError) throw checkError;

    if (meeting.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get all transcript segments
    const { data: segments } = await supabaseAdmin
      .from('transcript_segments')
      .select('*')
      .eq('meeting_id', id)
      .eq('is_final', true)
      .order('start_time', { ascending: true });

    // Compile full transcript
    const fullTranscript = segments
      ?.map(s => `[${s.speaker_name}]: ${s.text}`)
      .join('\n') || '';

    // Update meeting status
    const { data: updatedMeeting, error: updateError } = await supabaseAdmin
      .from('live_meetings')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString(),
        transcript: fullTranscript
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Generate MOM
    const mom = await generateMOM(updatedMeeting, segments);

    // Insert MOM
    const { data: momRecord, error: momError } = await supabaseAdmin
      .from('minutes_of_meeting')
      .insert(mom)
      .select()
      .single();

    if (momError) throw momError;

    // Trigger AI task extraction (using existing AI service)
    if (fullTranscript) {
      await triggerTaskExtraction(updatedMeeting, fullTranscript, userId);
    }

    res.json({
      meeting: updatedMeeting,
      mom: momRecord
    });
  } catch (error) {
    console.error('End meeting error:', error);
    res.status(500).json({ error: 'Failed to end meeting' });
  }
});

// Get meeting transcript
router.get('/:id/transcript', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: segments, error } = await supabaseAdmin
      .from('transcript_segments')
      .select('*')
      .eq('meeting_id', id)
      .eq('is_final', true)
      .order('start_time', { ascending: true });

    if (error) throw error;

    res.json({
      segments,
      fullText: segments?.map(s => `[${s.speaker_name}]: ${s.text}`).join('\n') || ''
    });
  } catch (error) {
    console.error('Get transcript error:', error);
    res.status(500).json({ error: 'Failed to fetch transcript' });
  }
});

// Get MOM for a meeting
router.get('/:id/mom', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: mom, error } = await supabaseAdmin
      .from('minutes_of_meeting')
      .select('*')
      .eq('meeting_id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'MOM not generated yet' });
      }
      throw error;
    }

    res.json(mom);
  } catch (error) {
    console.error('Get MOM error:', error);
    res.status(500).json({ error: 'Failed to fetch MOM' });
  }
});

// Get chat messages for a meeting
router.get('/:id/chat', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 100 } = req.query;

    const { data: messages, error } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('meeting_id', id)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json(messages?.reverse() || []);
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

// Get polls for a meeting
router.get('/:id/polls', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: polls, error } = await supabaseAdmin
      .from('polls')
      .select(`
        *,
        options:poll_options(
          *,
          votes:poll_votes(count)
        )
      `)
      .eq('meeting_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(polls || []);
  } catch (error) {
    console.error('Get polls error:', error);
    res.status(500).json({ error: 'Failed to fetch polls' });
  }
});

// Delete a meeting (host only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify meeting ownership
    const { data: meeting, error: checkError } = await supabaseAdmin
      .from('live_meetings')
      .select('user_id')
      .eq('id', id)
      .single();

    if (checkError) throw checkError;

    if (meeting.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized - Only host can delete meeting' });
    }

    // Delete meeting (cascade will handle related records)
    const { error: deleteError } = await supabaseAdmin
      .from('live_meetings')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Delete meeting error:', error);
    res.status(500).json({ error: 'Failed to delete meeting' });
  }
});

// Helper function to send meeting invitation email
async function sendMeetingInvitation(email, name, meeting, creatorId) {
  // Skip email sending if Brevo not configured
  if (!process.env.BREVO_API_KEY) {
    console.log('⚠️ Brevo API key not configured, skipping email invitation');
    return;
  }

  try {
    const { data: creator } = await supabaseAdmin
      .from('users')
      .select('display_name, email')
      .eq('id', creatorId)
      .single();

    const meetingUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/live-meetings/${meeting.id}`;
    const scheduledText = meeting.scheduled_at
      ? `Scheduled for: ${new Date(meeting.scheduled_at).toLocaleString()}`
      : 'Join now - Meeting is ready!';

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">Meeting Invitation</h2>
        
        <p>Hi ${name},</p>
        
        <p>${creator?.display_name || 'Your team admin'} has invited you to join a live meeting.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #000;">${meeting.title}</h3>
          ${meeting.description ? `<p style="margin: 10px 0; color: #666;">${meeting.description}</p>` : ''}
          <p style="margin: 10px 0;"><strong>${scheduledText}</strong></p>
        </div>
        
        <a href="${meetingUrl}" 
           style="display: inline-block; background: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Join Meeting
        </a>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Meeting Link: <a href="${meetingUrl}">${meetingUrl}</a>
        </p>
      </div>
    `;

    // Brevo Email Send
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
    
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    // Parse EMAIL_FROM to extract name and email
    const fromMatch = process.env.EMAIL_FROM.match(/^(.+?)\s*<(.+)>$/);
    const fromName = fromMatch ? fromMatch[1].trim() : 'AutoExec AI';
    const fromEmail = fromMatch ? fromMatch[2].trim() : process.env.EMAIL_FROM;
    
    sendSmtpEmail.sender = { name: `${creator?.display_name || 'Admin'} via ${fromName}`, email: fromEmail };
    sendSmtpEmail.to = [{ email: email, name: name }];
    sendSmtpEmail.replyTo = { email: creator?.email || fromEmail, name: creator?.display_name || 'Admin' };
    sendSmtpEmail.subject = `Meeting Invitation: ${meeting.title}`;
    sendSmtpEmail.htmlContent = html;
    
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Meeting invitation sent to ${email} via Brevo`);

    // SMTP Method (COMMENTED OUT - Using Brevo instead)
    // Skip email sending if SMTP not configured
    // if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    //   console.log('⚠️ SMTP not configured, skipping email invitation');
    //   return;
    // }
    // const transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST,
    //   port: process.env.SMTP_PORT,
    //   secure: false,
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASS
    //   }
    // });
    // await transporter.sendMail({
    //   from: `${creator?.display_name || 'Admin'} via AutoExec AI <${process.env.SMTP_USER}>`,
    //   replyTo: `${creator?.display_name || 'Admin'} <${creator?.email || process.env.SMTP_USER}>`,
    //   to: email,
    //   subject: `Meeting Invitation: ${meeting.title}`,
    //   html
    // });

  } catch (error) {
    console.error('Error sending meeting invitation:', error.message);
    // Don't throw - allow meeting creation to succeed even if email fails
  }
}

// Helper function to generate MOM using AI
async function generateMOM(meeting, segments) {
  try {
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    const fullTranscript = segments
      ?.map(s => `[${s.speaker_name}]: ${s.text}`)
      .join('\n') || '';

    // Get participants
    const { data: participants } = await supabaseAdmin
      .from('meeting_participants')
      .select('team_member:team_members(name)')
      .eq('meeting_id', meeting.id);

    const participantNames = participants
      ?.map(p => p.team_member?.name)
      .filter(Boolean) || [];

    const duration = meeting.started_at && meeting.ended_at
      ? Math.round((new Date(meeting.ended_at) - new Date(meeting.started_at)) / 60000)
      : 0;

    // Call AI service to generate MOM
    const response = await axios.post(`${AI_SERVICE_URL}/generate-mom`, {
      transcript: fullTranscript,
      meetingTitle: meeting.title,
      participants: participantNames
    }, {
      timeout: 60000
    });

    return {
      meeting_id: meeting.id,
      meeting_title: meeting.title,
      meeting_date: meeting.started_at || meeting.created_at,
      participants: participantNames,
      duration_minutes: duration,
      summary: response.data.summary || '',
      key_points: response.data.key_points || [],
      decisions: response.data.decisions || [],
      action_items: response.data.action_items || [],
      sentiment: response.data.sentiment || 'neutral',
      topics: response.data.topics || []
    };
  } catch (error) {
    console.error('Error generating MOM:', error);
    
    // Return basic MOM if AI fails
    return {
      meeting_id: meeting.id,
      meeting_title: meeting.title,
      meeting_date: meeting.started_at || meeting.created_at,
      participants: [],
      duration_minutes: 0,
      summary: 'Meeting summary generation failed. Please review transcript manually.',
      key_points: [],
      decisions: [],
      action_items: [],
      sentiment: 'neutral',
      topics: []
    };
  }
}

// Helper function to trigger task extraction
async function triggerTaskExtraction(meeting, transcript, userId) {
  try {
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

    // Get team members
    const { data: teamMembers } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    // Update processing status
    await supabaseAdmin
      .from('live_meetings')
      .update({ processing_status: 'processing' })
      .eq('id', meeting.id);

    // Call AI service
    const response = await axios.post(`${AI_SERVICE_URL}/process-meeting`, {
      meeting_id: meeting.id,
      user_id: userId,
      transcript,
      team_members: teamMembers || [],
      ai_provider: 'groq'
    }, {
      timeout: 120000
    });

    const { tasks, audit_logs } = response.data;

    // Insert tasks (existing logic)
    for (const task of tasks) {
      const { data: insertedTask } = await supabaseAdmin
        .from('tasks')
        .insert({
          meeting_id: meeting.id,
          user_id: userId,
          assigned_to: task.assigned_to,
          title: task.title,
          description: task.description,
          priority: task.priority,
          deadline: task.deadline,
          assignment_reason: task.assignment_reason,
          assignment_confidence: task.assignment_confidence,
          metadata: task.metadata || {}
        })
        .select()
        .single();

      // Send notifications
      if (insertedTask && task.assigned_to) {
        const assignee = teamMembers.find(tm => tm.id === task.assigned_to);
        if (assignee) {
          await sendNotification(
            insertedTask.id,
            assignee.id,
            'assignment',
            assignee.slack_webhook
          );
        }
      }
    }

    // Insert audit logs
    if (audit_logs && audit_logs.length > 0) {
      await supabaseAdmin
        .from('audit_logs')
        .insert(audit_logs.map(log => ({
          ...log,
          user_id: userId,
          meeting_id: meeting.id
        })));
    }

    // Update meeting status
    await supabaseAdmin
      .from('live_meetings')
      .update({
        processed: true,
        processing_status: 'completed'
      })
      .eq('id', meeting.id);

  } catch (error) {
    console.error('Task extraction error:', error);
    
    await supabaseAdmin
      .from('live_meetings')
      .update({ processing_status: 'failed' })
      .eq('id', meeting.id);
  }
}

export default router;
