import nodemailer from 'nodemailer';
import { supabaseAdmin } from '../config/supabase.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send notification when employee requests completion
export async function sendCompletionRequestNotification(taskId, teamMemberId, completionRequestId) {
  try {
    // Get task, team member, and admin details
    const { data: task } = await supabaseAdmin
      .from('tasks')
      .select('*, assigned_to_member:team_members!tasks_assigned_to_fkey(name, email)')
      .eq('id', taskId)
      .single();

    const { data: admin } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', task.user_id)
      .single();

    if (!task || !admin) return;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const employeeName = task.assigned_to_member?.name || 'Team Member';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .task-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 10px 10px 0; }
          .button-success { background: #10b981; }
          .button-danger { background: #ef4444; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Task Completion Request</h1>
            <p>A team member has requested task completion approval</p>
          </div>
          <div class="content">
            <p>Hi ${admin.display_name},</p>
            <p><strong>${employeeName}</strong> has marked a task as completed and is requesting your review.</p>
            
            <div class="alert-box">
              <strong>⏰ Action Required:</strong> Please review and approve or reject this completion request.
            </div>
            
            <div class="task-card">
              <h2>${task.title}</h2>
              <p>${task.description || 'No description provided'}</p>
              <p><strong>Priority:</strong> ${task.priority}</p>
              <p><strong>Assigned to:</strong> ${employeeName}</p>
              ${task.deadline ? `<p><strong>Deadline:</strong> ${new Date(task.deadline).toLocaleDateString()}</p>` : ''}
            </div>
            
            <div style="margin-top: 20px;">
              <a href="${frontendUrl}/admin/completion-requests" class="button">
                Review Completion Request
              </a>
            </div>
            
            <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
              💡 <em>Review the task completion and approve or reject with feedback.</em>
            </p>
          </div>
          <div class="footer">
            <p>AutoExec AI - Intelligent Task Management</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `AutoExec AI <${process.env.SMTP_USER}>`,
      to: admin.email,
      subject: `Task Completion Request: ${task.title}`,
      html
    });

    // Create notification record
    await supabaseAdmin
      .from('notifications')
      .insert({
        task_id: taskId,
        team_member_id: teamMemberId,
        completion_request_id: completionRequestId,
        type: 'completion_request',
        channel: 'email',
        status: 'sent',
        sent_at: new Date().toISOString()
      });

  } catch (error) {
    console.error('Send completion request notification error:', error);
  }
}

// Send notification when admin approves/rejects completion
export async function sendCompletionReviewNotification(taskId, teamMemberId, status, reviewNotes, completionRequestId) {
  try {
    const { data: task } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    const { data: teamMember } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .eq('id', teamMemberId)
      .single();

    const { data: admin } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', task.user_id)
      .single();

    if (!task || !teamMember || !admin) return;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const isApproved = status === 'approved';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${isApproved ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}; color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .task-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .status-box { background: ${isApproved ? '#d1fae5' : '#fee2e2'}; border-left: 4px solid ${isApproved ? '#10b981' : '#ef4444'}; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .review-notes { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #667eea; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isApproved ? '✅ Task Approved!' : '❌ Task Needs Revision'}</h1>
            <p>Your completion request has been ${isApproved ? 'approved' : 'rejected'}</p>
          </div>
          <div class="content">
            <p>Hi ${teamMember.name},</p>
            <p>${admin.display_name} has reviewed your task completion request.</p>
            
            <div class="status-box">
              <strong>${isApproved ? '🎉 Congratulations!' : '⚠️ Revision Required'}</strong><br>
              ${isApproved 
                ? 'Your task has been marked as completed. Great work!' 
                : 'Your task completion was not approved. Please review the feedback and resubmit.'}
            </div>
            
            <div class="task-card">
              <h2>${task.title}</h2>
              <p>${task.description || 'No description provided'}</p>
              <p><strong>Priority:</strong> ${task.priority}</p>
            </div>
            
            ${reviewNotes ? `
              <div class="review-notes">
                <h4 style="margin-top: 0; color: #1f2937;">📝 Review Feedback:</h4>
                <p style="margin: 0; color: #4b5563;">${reviewNotes}</p>
              </div>
            ` : ''}
            
            <a href="${frontendUrl}/employee/tasks" class="button">View Your Tasks</a>
            
            <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
              ${isApproved 
                ? '💡 <em>Keep up the excellent work!</em>' 
                : '💡 <em>Please address the feedback and resubmit when ready.</em>'}
            </p>
          </div>
          <div class="footer">
            <p>AutoExec AI - Intelligent Task Management</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `${admin.display_name} via AutoExec AI <${process.env.SMTP_USER}>`,
      replyTo: `${admin.display_name} <${admin.email}>`,
      to: teamMember.email,
      subject: `Task ${isApproved ? 'Approved' : 'Needs Revision'}: ${task.title}`,
      html
    });

    // Create notification record
    await supabaseAdmin
      .from('notifications')
      .insert({
        task_id: taskId,
        team_member_id: teamMemberId,
        completion_request_id: completionRequestId,
        type: isApproved ? 'completion_approved' : 'completion_rejected',
        channel: 'email',
        status: 'sent',
        sent_at: new Date().toISOString()
      });

  } catch (error) {
    console.error('Send completion review notification error:', error);
  }
}
