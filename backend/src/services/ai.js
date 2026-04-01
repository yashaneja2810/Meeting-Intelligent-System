import axios from 'axios';
import { supabaseAdmin } from '../config/supabase.js';
import { sendNotification } from './notifications.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Keep AI service alive by pinging it periodically
let keepAliveInterval = null;

export function startKeepAlive() {
  if (keepAliveInterval) return;
  
  console.log('🔄 Starting AI service keep-alive pings...');
  
  // Ping immediately
  pingAIService();
  
  // Then ping every 2 minutes
  keepAliveInterval = setInterval(async () => {
    await pingAIService();
  }, 2 * 60 * 1000); // 2 minutes
}

async function pingAIService() {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`, {
      timeout: 5000
    });
    console.log('✅ AI service is alive:', response.data);
  } catch (error) {
    console.log('⚠️ AI service ping failed (might be sleeping):', error.message);
  }
}

export async function processTranscript(meetingId, userId, transcript, aiProvider = 'gemini') {
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

    console.log(`📞 Calling AI service for meeting ${meetingId}...`);

    // Call AI service with retry logic for cold starts
    let response;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`Attempt ${attempts}/${maxAttempts} to call AI service...`);
        
        response = await axios.post(`${AI_SERVICE_URL}/process-meeting`, {
          meeting_id: meetingId,
          user_id: userId,
          transcript,
          team_members: teamMembers,
          ai_provider: aiProvider
        }, {
          timeout: attempts === 1 ? 90000 : 60000 // First attempt: 90s (cold start), others: 60s
        });
        
        console.log('✅ AI service responded successfully');
        break; // Success, exit retry loop
        
      } catch (error) {
        console.error(`❌ Attempt ${attempts} failed:`, error.message);
        
        if (attempts >= maxAttempts) {
          throw error; // All attempts failed
        }
        
        // Wait before retry (exponential backoff)
        const waitTime = attempts * 10000; // 10s, 20s
        console.log(`⏳ Waiting ${waitTime/1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

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
