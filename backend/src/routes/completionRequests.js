import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { sendCompletionRequestNotification, sendCompletionReviewNotification } from '../services/completionNotifications.js';

const router = express.Router();

router.use(authenticate);

// Get all completion requests (admin sees all, employee sees their own)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;

    // Check if user is admin (has tasks) or employee (is team member)
    const { data: userTasks } = await supabaseAdmin
      .from('tasks')
      .select('id')
      .eq('user_id', req.user.id)
      .limit(1);

    let query = supabaseAdmin
      .from('completion_requests')
      .select(`
        *,
        task:tasks!completion_requests_task_id_fkey(*),
        requested_by_member:team_members!completion_requests_requested_by_fkey(id, name, email, role),
        reviewed_by_user:users!completion_requests_reviewed_by_fkey(id, display_name, email)
      `)
      .order('created_at', { ascending: false });

    if (userTasks && userTasks.length > 0) {
      // Admin - see all requests for their tasks
      const { data: adminTasks } = await supabaseAdmin
        .from('tasks')
        .select('id')
        .eq('user_id', req.user.id);
      
      const taskIds = adminTasks.map(t => t.id);
      query = query.in('task_id', taskIds);
    } else {
      // Employee - see only their own requests
      const { data: teamMember } = await supabaseAdmin
        .from('team_members')
        .select('id')
        .eq('email', req.user.email)
        .single();

      if (!teamMember) {
        return res.json([]);
      }

      query = query.eq('requested_by', teamMember.id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Get completion requests error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Create a completion request (employee)
router.post('/', async (req, res) => {
  try {
    const { taskId, completionNotes, attachments } = req.body;

    // Get team member ID
    const { data: teamMember } = await supabaseAdmin
      .from('team_members')
      .select('id, name')
      .eq('email', req.user.email)
      .single();

    if (!teamMember) {
      return res.status(403).json({ error: 'Not a team member' });
    }

    // Verify task is assigned to this team member
    const { data: task } = await supabaseAdmin
      .from('tasks')
      .select('*, assigned_to_member:team_members!tasks_assigned_to_fkey(id, name)')
      .eq('id', taskId)
      .single();

    if (!task || task.assigned_to !== teamMember.id) {
      return res.status(403).json({ error: 'Task not assigned to you' });
    }

    // Check if task is already completed or has pending request
    if (task.status === 'completed') {
      return res.status(400).json({ error: 'Task is already completed' });
    }

    if (task.status === 'pending_review') {
      return res.status(400).json({ error: 'Task already has a pending completion request' });
    }

    // Create completion request
    const { data: completionRequest, error } = await supabaseAdmin
      .from('completion_requests')
      .insert({
        task_id: taskId,
        requested_by: teamMember.id,
        completion_notes: completionNotes,
        attachments: attachments || []
      })
      .select()
      .single();

    if (error) throw error;

    // Send notification to admin
    await sendCompletionRequestNotification(taskId, teamMember.id, completionRequest.id);

    res.json(completionRequest);
  } catch (error) {
    console.error('Create completion request error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Approve or reject completion request (admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get completion request
    const { data: request, error: fetchError } = await supabaseAdmin
      .from('completion_requests')
      .select('*, task:tasks!completion_requests_task_id_fkey(id, user_id)')
      .eq('id', id)
      .single();

    if (fetchError || !request) {
      console.error('Fetch completion request error:', fetchError);
      return res.status(404).json({ error: 'Completion request not found' });
    }

    // Verify user is the task owner (admin)
    if (request.task.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to review this request' });
    }

    // Update completion request
    const { data: updatedRequest, error } = await supabaseAdmin
      .from('completion_requests')
      .update({
        status,
        reviewed_by: req.user.id,
        review_notes: reviewNotes,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Send notification to employee
    await sendCompletionReviewNotification(
      request.task_id,
      request.requested_by,
      status,
      reviewNotes,
      id
    );

    res.json(updatedRequest);
  } catch (error) {
    console.error('Update completion request error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get pending completion requests count (for admin dashboard)
router.get('/count/pending', async (req, res) => {
  try {
    const { data: tasks } = await supabaseAdmin
      .from('tasks')
      .select('id')
      .eq('user_id', req.user.id);

    if (!tasks || tasks.length === 0) {
      return res.json({ count: 0 });
    }

    const taskIds = tasks.map(t => t.id);

    const { count, error } = await supabaseAdmin
      .from('completion_requests')
      .select('*', { count: 'exact', head: true })
      .in('task_id', taskIds)
      .eq('status', 'pending');

    if (error) throw error;
    res.json({ count: count || 0 });
  } catch (error) {
    console.error('Get pending count error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
