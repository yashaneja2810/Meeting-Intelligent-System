import { supabaseAdmin } from '../config/supabase.js';
import { sendNotification } from './notifications.js';

export async function checkDeadlines() {
  try {
    const now = new Date();
    
    // Get all pending tasks with deadlines
    const { data: tasks, error } = await supabaseAdmin
      .from('tasks')
      .select(`
        *,
        assigned_member:team_members(*)
      `)
      .in('status', ['pending', 'in_progress'])
      .not('deadline', 'is', null)
      .not('assigned_to', 'is', null);

    if (error) throw error;

    for (const task of tasks) {
      const deadline = new Date(task.deadline);
      const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);

      // Get user preferences
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('preferences')
        .eq('id', task.user_id)
        .single();

      const preferences = user?.preferences || {
        reminder_intervals: [24, 48, 72],
        escalation_rules: {
          first_reminder: 24,
          second_reminder: 48,
          escalate_after: 72
        }
      };

      // Check if deadline has passed
      if (hoursUntilDeadline < 0) {
        await handleMissedDeadline(task, preferences);
      } else {
        // Check for reminders
        await checkReminders(task, hoursUntilDeadline, preferences);
      }
    }

    console.log(`Checked ${tasks.length} tasks for deadlines`);
  } catch (error) {
    console.error('Check deadlines error:', error);
    throw error;
  }
}

async function handleMissedDeadline(task, preferences) {
  const now = new Date();
  const deadline = new Date(task.deadline);
  const hoursPastDeadline = (now - deadline) / (1000 * 60 * 60);

  const escalateAfter = preferences.escalation_rules?.escalate_after || 72;

  // Check if already escalated
  const { data: existingEscalation } = await supabaseAdmin
    .from('escalations')
    .select('*')
    .eq('task_id', task.id)
    .eq('resolved', false)
    .single();

  if (!existingEscalation && hoursPastDeadline >= escalateAfter) {
    // Create escalation
    await supabaseAdmin
      .from('escalations')
      .insert({
        task_id: task.id,
        original_assignee: task.assigned_to,
        reason: `Task missed deadline by ${Math.floor(hoursPastDeadline)} hours`
      });

    // Send escalation notification
    await sendNotification(task.id, task.assigned_to, 'escalation');

    // Log escalation
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: task.user_id,
        task_id: task.id,
        agent_name: 'Failure Detection Agent',
        action: 'Task Escalated',
        reasoning: `Task missed deadline by ${Math.floor(hoursPastDeadline)} hours. Automatic escalation triggered.`
      });
  }
}

async function checkReminders(task, hoursUntilDeadline, preferences) {
  const reminderIntervals = preferences.reminder_intervals || [24, 48, 72];

  for (const interval of reminderIntervals) {
    // Check if we should send a reminder (within 1 hour window)
    if (Math.abs(hoursUntilDeadline - interval) < 1) {
      // Check if reminder already sent
      const { data: existingNotification } = await supabaseAdmin
        .from('notifications')
        .select('*')
        .eq('task_id', task.id)
        .eq('type', 'reminder')
        .gte('created_at', new Date(Date.now() - interval * 60 * 60 * 1000).toISOString())
        .single();

      if (!existingNotification) {
        await sendNotification(task.id, task.assigned_to, 'reminder');

        // Log reminder
        await supabaseAdmin
          .from('audit_logs')
          .insert({
            user_id: task.user_id,
            task_id: task.id,
            agent_name: 'Tracking Agent',
            action: 'Reminder Sent',
            reasoning: `Task deadline approaching in ${Math.floor(hoursUntilDeadline)} hours. Reminder sent to assignee.`
          });
      }
    }
  }
}
