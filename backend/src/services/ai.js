import axios from 'axios';
import { supabaseAdmin } from '../config/supabase.js';
import { sendNotification } from './notifications.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export async function processTranscript(meetingId, userId, transcript) {
  try {
    // Update meeting status
    await supabaseAdmin
      .from('meetings')
      .update({ processing_status: 'processing' })
      .eq('id', meetingId);

    // Get team members for context
    const { data: teamMembers } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    // Call AI service
    const response = await axios.post(`${AI_SERVICE_URL}/process-meeting`, {
      meeting_id: meetingId,
      user_id: userId,
      transcript,
      team_members: teamMembers
    }, {
      timeout: 60000 // 60 second timeout
    });

    const { tasks, audit_logs } = response.data;

    // Insert tasks
    if (tasks && tasks.length > 0) {
      const { data: insertedTasks, error: tasksError } = await supabaseAdmin
        .from('tasks')
        .insert(tasks.map(task => ({
          ...task,
          meeting_id: meetingId,
          user_id: userId
        })))
        .select();

      if (tasksError) throw tasksError;

      // Send notifications for assigned tasks
      for (const task of insertedTasks) {
        if (task.assigned_to) {
          await sendNotification(task.id, task.assigned_to, 'assignment');
        }
      }
    }

    // Insert audit logs
    if (audit_logs && audit_logs.length > 0) {
      await supabaseAdmin
        .from('audit_logs')
        .insert(audit_logs.map(log => ({
          ...log,
          meeting_id: meetingId,
          user_id: userId
        })));
    }

    // Update meeting status
    await supabaseAdmin
      .from('meetings')
      .update({
        processed: true,
        processing_status: 'completed'
      })
      .eq('id', meetingId);

    return { success: true, tasks };
  } catch (error) {
    console.error('Process transcript error:', error);

    // Update meeting status to failed
    await supabaseAdmin
      .from('meetings')
      .update({ processing_status: 'failed' })
      .eq('id', meetingId);

    throw error;
  }
}
