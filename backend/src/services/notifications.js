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
  
  console.log('Email template admin info:', { adminName, adminEmail }); // Debug log
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .task-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .admin-info { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #667eea; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AutoExec AI</h1>
          <p>${getNotificationTitle(type)}</p>
        </div>
        <div class="content">
          <p>Hi ${member.name},</p>
          <p>${getNotificationMessage(type, task)}</p>
          
          <div class="admin-info">
            <strong>📧 Assigned by:</strong> ${adminName}${adminEmail ? ` (${adminEmail})` : ''}
          </div>
          
          <div class="task-card">
            <h2>${task.title}</h2>
            <p>${task.description || 'No description provided'}</p>
            <p><strong>Priority:</strong> ${task.priority}</p>
            <p><strong>Deadline:</strong> ${task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Not set'}</p>
            ${task.assignment_reason ? `<p><strong>Assignment Reason:</strong> ${task.assignment_reason}</p>` : ''}
          </div>
          
          <a href="${frontendUrl}/employee/tasks" class="button">View Task</a>
          
          <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
            💡 <em>Reply to this email to contact ${adminName} directly.</em>
          </p>
        </div>
        <div class="footer">
          <p>AutoExec AI - Intelligent Meeting-to-Execution System</p>
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
