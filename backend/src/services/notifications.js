import nodemailer from 'nodemailer';
import axios from 'axios';
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

export async function sendNotification(taskId, teamMemberId, type) {
  try {
    // Get task and team member details
    const { data: task, error: taskError } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    const { data: member, error: memberError } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .eq('id', teamMemberId)
      .single();

    if (taskError || memberError || !task || !member) {
      console.error('Task or member fetch error:', { taskError, memberError });
      throw new Error('Task or team member not found');
    }

    // Get admin/creator details - try both users and profiles tables
    let admin = null;
    
    // First try profiles table
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('display_name, email')
      .eq('id', task.user_id)
      .single();
    
    if (profileData && !profileError) {
      admin = profileData;
    } else {
      // Fallback to users table (auth.users)
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(task.user_id);
      
      if (userData && !userError) {
        admin = {
          display_name: userData.user?.user_metadata?.display_name || userData.user?.email?.split('@')[0] || 'Admin',
          email: userData.user?.email || ''
        };
      } else {
        console.error('Admin fetch error:', { profileError, userError });
        // Use fallback values
        admin = {
          display_name: 'Admin',
          email: process.env.SMTP_USER
        };
      }
    }

    console.log('Admin data fetched:', admin); // Debug log

    // Determine notification channel
    const channel = member.slack_webhook ? 'both' : 'email';

    // Create notification record
    const { data: notification } = await supabaseAdmin
      .from('notifications')
      .insert({
        task_id: taskId,
        team_member_id: teamMemberId,
        type,
        channel,
        status: 'pending'
      })
      .select()
      .single();

    // Send email
    try {
      await sendEmail(member, task, type, admin);
    } catch (emailError) {
      console.error('Email send error:', emailError);
    }

    // Send Slack notification if webhook exists
    if (member.slack_webhook) {
      try {
        await sendSlackNotification(member.slack_webhook, task, type);
      } catch (slackError) {
        console.error('Slack send error:', slackError);
      }
    }

    // Update notification status
    await supabaseAdmin
      .from('notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', notification.id);

    return { success: true };
  } catch (error) {
    console.error('Send notification error:', error);
    throw error;
  }
}

async function sendEmail(member, task, type, admin) {
  const subject = getEmailSubject(type, task);
  const html = getEmailTemplate(member, task, type, admin);

  // Dynamic display name with admin info + Reply-To header
  const adminName = admin?.display_name || 'Admin';
  const adminEmail = admin?.email || process.env.SMTP_USER;
  
  console.log('Sending email with admin info:', { adminName, adminEmail }); // Debug log
  
  const mailOptions = {
    from: `${adminName} via AutoExec AI <${process.env.SMTP_USER}>`,
    replyTo: `${adminName} <${adminEmail}>`,
    to: member.email,
    subject,
    html
  };

  await transporter.sendMail(mailOptions);
}

async function sendSlackNotification(webhook, task, type) {
  const message = getSlackMessage(task, type);

  await axios.post(webhook, {
    text: message,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Priority:*\n${task.priority}`
          },
          {
            type: 'mrkdwn',
            text: `*Deadline:*\n${task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Not set'}`
          }
        ]
      }
    ]
  });
}

function getEmailSubject(type, task) {
  switch (type) {
    case 'assignment':
      return `New Task Assigned: ${task.title}`;
    case 'reminder':
      return `Reminder: ${task.title}`;
    case 'escalation':
      return `Urgent: Task Escalated - ${task.title}`;
    case 'completion':
      return `Task Completed: ${task.title}`;
    default:
      return `Task Update: ${task.title}`;
  }
}

function getEmailTemplate(member, task, type, admin) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const adminName = admin?.display_name || 'Admin';
  const adminEmail = admin?.email || '';
  
  return `
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
        .admin-info {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
        }
        .admin-info strong {
          color: #1f2937;
          font-size: 14px;
        }
        .admin-info span {
          color: #6b7280;
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
        .task-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
        }
        .meta-item {
          font-size: 13px;
        }
        .meta-label {
          color: #9ca3af;
          font-weight: 500;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
        }
        .meta-value {
          color: #1f2937;
          font-weight: 600;
          display: block;
          margin-top: 4px;
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
          <h1>${getNotificationTitle(type)}</h1>
          <p>AutoExec AI</p>
        </div>
        <div class="content">
          <p class="greeting">Hi ${member.name},</p>
          <p class="message">${getNotificationMessage(type, task)}</p>
          
          <div class="admin-info">
            <strong>Assigned by:</strong> <span>${adminName}${adminEmail ? ` • ${adminEmail}` : ''}</span>
          </div>
          
          <div class="task-card">
            <h2>${task.title}</h2>
            <p>${task.description || 'No description provided'}</p>
            
            <div class="task-meta">
              <div class="meta-item">
                <div class="meta-label">Priority</div>
                <div class="meta-value">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Deadline</div>
                <div class="meta-value">${task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Not set'}</div>
              </div>
            </div>
            
            ${task.assignment_reason ? `
              <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #f3f4f6;">
                <div class="meta-label">Assignment Reason</div>
                <p style="margin-top: 8px; font-size: 13px; color: #4b5563; font-style: italic;">
                  ${task.assignment_reason.length > 150 ? task.assignment_reason.substring(0, 147) + '...' : task.assignment_reason}
                </p>
              </div>
            ` : ''}
          </div>
          
          <a href="${frontendUrl}/employee/tasks" class="button">View Task</a>
          
          <div class="note">
            💡 Reply to this email to contact ${adminName} directly.
          </div>
        </div>
        <div class="footer">
          <p>AutoExec AI</p>
          <p>Intelligent Meeting-to-Execution System</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getSlackMessage(task, type) {
  switch (type) {
    case 'assignment':
      return `🎯 *New Task Assigned*\n\n*${task.title}*\n${task.description || ''}\n\nPriority: ${task.priority}\nDeadline: ${task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Not set'}`;
    case 'reminder':
      return `⏰ *Task Reminder*\n\n*${task.title}*\nThis task is approaching its deadline.\n\nDeadline: ${task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Not set'}`;
    case 'escalation':
      return `🚨 *Task Escalated*\n\n*${task.title}*\nThis task has been escalated due to missed deadline.\n\nImmediate action required!`;
    default:
      return `📋 *Task Update*\n\n*${task.title}*`;
  }
}

function getNotificationTitle(type) {
  switch (type) {
    case 'assignment':
      return 'You have a new task';
    case 'reminder':
      return 'Task reminder';
    case 'escalation':
      return 'Task escalation';
    case 'completion':
      return 'Task completed';
    default:
      return 'Task update';
  }
}

function getNotificationMessage(type, task) {
  switch (type) {
    case 'assignment':
      return 'A new task has been assigned to you based on your role and expertise.';
    case 'reminder':
      return 'This is a reminder about your pending task. The deadline is approaching.';
    case 'escalation':
      return 'This task has been escalated due to a missed deadline. Please take immediate action.';
    case 'completion':
      return 'Great job! This task has been marked as completed.';
    default:
      return 'There has been an update to your task.';
  }
}
