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
    const { data: task } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    const { data: member } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .eq('id', teamMemberId)
      .single();

    if (!task || !member) {
      throw new Error('Task or team member not found');
    }

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
      await sendEmail(member, task, type);
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

async function sendEmail(member, task, type) {
  const subject = getEmailSubject(type, task);
  const html = getEmailTemplate(member, task, type);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: member.email,
    subject,
    html
  });
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

function getEmailTemplate(member, task, type) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
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
          
          <div class="task-card">
            <h2>${task.title}</h2>
            <p>${task.description || 'No description provided'}</p>
            <p><strong>Priority:</strong> ${task.priority}</p>
            <p><strong>Deadline:</strong> ${task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Not set'}</p>
            ${task.assignment_reason ? `<p><strong>Assignment Reason:</strong> ${task.assignment_reason}</p>` : ''}
          </div>
          
          <a href="${frontendUrl}/dashboard/tasks" class="button">View Task</a>
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
