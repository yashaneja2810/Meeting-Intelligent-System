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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #f9fafb;
            padding: 20px 10px;
          }
          .container { 
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .header {
            background: #000000;
            color: white;
            padding: 32px 24px;
            text-align: center;
          }
          .header h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }
          .header p {
            font-size: 15px;
            opacity: 0.9;
            font-weight: 500;
          }
          .content {
            padding: 32px 24px;
          }
          .greeting {
            font-size: 16px;
            color: #1f2937;
            margin-bottom: 16px;
            font-weight: 600;
          }
          .message {
            font-size: 15px;
            color: #4b5563;
            margin-bottom: 24px;
            line-height: 1.6;
          }
          .alert-box {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
          }
          .alert-box strong {
            color: #92400e;
            font-size: 14px;
          }
          .task-card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
          }
          .task-card h2 {
            font-size: 18px;
            font-weight: 700;
            color: #000000;
            margin-bottom: 12px;
            letter-spacing: -0.3px;
          }
          .task-card p {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
            line-height: 1.5;
          }
          .task-card strong {
            color: #1f2937;
            font-weight: 600;
          }
          .button {
            display: inline-block;
            background: #000000;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 15px;
            text-align: center;
            margin: 8px 0;
          }
          .note {
            margin-top: 24px;
            padding: 16px;
            background: #f9fafb;
            border-radius: 12px;
            font-size: 14px;
            color: #6b7280;
            line-height: 1.5;
          }
          .footer {
            text-align: center;
            padding: 24px;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
          }
          .footer p {
            font-size: 13px;
            color: #9ca3af;
            margin: 4px 0;
          }
          
          @media only screen and (max-width: 600px) {
            body { padding: 10px 5px; }
            .container { border-radius: 12px; }
            .header { padding: 24px 20px; }
            .header h1 { font-size: 20px; }
            .content { padding: 24px 20px; }
            .task-card { padding: 16px; }
            .button { display: block; width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Task Completion Request</h1>
            <p>AutoExec AI</p>
          </div>
          <div class="content">
            <p class="greeting">Hi ${admin.display_name},</p>
            <p class="message"><strong>${employeeName}</strong> has marked a task as completed and is requesting your review.</p>
            
            <div class="alert-box">
              <strong>⏰ Action Required:</strong> Please review and approve or reject this completion request.
            </div>
            
            <div class="task-card">
              <h2>${task.title}</h2>
              <p>${task.description || 'No description provided'}</p>
              <p><strong>Priority:</strong> ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</p>
              <p><strong>Assigned to:</strong> ${employeeName}</p>
              ${task.deadline ? `<p><strong>Deadline:</strong> ${new Date(task.deadline).toLocaleDateString()}</p>` : ''}
            </div>
            
            <a href="${frontendUrl}/admin/completion-requests" class="button">
              Review Completion Request
            </a>
            
            <div class="note">
              💡 Review the task completion and approve or reject with feedback.
            </div>
          </div>
          <div class="footer">
            <p>AutoExec AI</p>
            <p>Intelligent Task Management</p>
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #f9fafb;
            padding: 20px 10px;
          }
          .container { 
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .header {
            background: ${isApproved ? '#10b981' : '#ef4444'};
            color: white;
            padding: 32px 24px;
            text-align: center;
          }
          .header h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }
          .header p {
            font-size: 15px;
            opacity: 0.9;
            font-weight: 500;
          }
          .content {
            padding: 32px 24px;
          }
          .greeting {
            font-size: 16px;
            color: #1f2937;
            margin-bottom: 16px;
            font-weight: 600;
          }
          .message {
            font-size: 15px;
            color: #4b5563;
            margin-bottom: 24px;
            line-height: 1.6;
          }
          .status-box {
            background: ${isApproved ? '#d1fae5' : '#fee2e2'};
            border: 1px solid ${isApproved ? '#10b981' : '#ef4444'};
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
          }
          .status-box strong {
            color: ${isApproved ? '#065f46' : '#991b1b'};
            font-size: 14px;
            display: block;
            margin-bottom: 4px;
          }
          .status-box p {
            color: ${isApproved ? '#047857' : '#dc2626'};
            font-size: 14px;
            margin: 0;
          }
          .task-card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
          }
          .task-card h2 {
            font-size: 18px;
            font-weight: 700;
            color: #000000;
            margin-bottom: 12px;
            letter-spacing: -0.3px;
          }
          .task-card p {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
            line-height: 1.5;
          }
          .task-card strong {
            color: #1f2937;
            font-weight: 600;
          }
          .review-notes {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
          }
          .review-notes h4 {
            font-size: 14px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 8px;
          }
          .review-notes p {
            font-size: 14px;
            color: #4b5563;
            margin: 0;
            line-height: 1.5;
          }
          .button {
            display: inline-block;
            background: #000000;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 15px;
            text-align: center;
            margin: 8px 0;
          }
          .note {
            margin-top: 24px;
            padding: 16px;
            background: #f9fafb;
            border-radius: 12px;
            font-size: 14px;
            color: #6b7280;
            line-height: 1.5;
          }
          .footer {
            text-align: center;
            padding: 24px;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
          }
          .footer p {
            font-size: 13px;
            color: #9ca3af;
            margin: 4px 0;
          }
          
          @media only screen and (max-width: 600px) {
            body { padding: 10px 5px; }
            .container { border-radius: 12px; }
            .header { padding: 24px 20px; }
            .header h1 { font-size: 20px; }
            .content { padding: 24px 20px; }
            .task-card { padding: 16px; }
            .button { display: block; width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isApproved ? 'Task Approved' : 'Task Needs Revision'}</h1>
            <p>AutoExec AI</p>
          </div>
          <div class="content">
            <p class="greeting">Hi ${teamMember.name},</p>
            <p class="message">${admin.display_name} has reviewed your task completion request.</p>
            
            <div class="status-box">
              <strong>${isApproved ? '🎉 Congratulations!' : '⚠️ Revision Required'}</strong>
              <p>${isApproved 
                ? 'Your task has been marked as completed. Great work!' 
                : 'Your task completion was not approved. Please review the feedback and resubmit.'}</p>
            </div>
            
            <div class="task-card">
              <h2>${task.title}</h2>
              <p>${task.description || 'No description provided'}</p>
              <p><strong>Priority:</strong> ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</p>
            </div>
            
            ${reviewNotes ? `
              <div class="review-notes">
                <h4>📝 Review Feedback</h4>
                <p>${reviewNotes}</p>
              </div>
            ` : ''}
            
            <a href="${frontendUrl}/employee/tasks" class="button">View Your Tasks</a>
            
            <div class="note">
              ${isApproved 
                ? '💡 Keep up the excellent work!' 
                : '💡 Please address the feedback and resubmit when ready.'}
            </div>
          </div>
          <div class="footer">
            <p>AutoExec AI</p>
            <p>Intelligent Task Management</p>
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
