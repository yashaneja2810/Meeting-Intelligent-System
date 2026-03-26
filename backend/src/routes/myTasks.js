import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Get tasks assigned to the logged-in user (as a team member)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;

    // Find team member record for this user
    const { data: teamMember } = await supabaseAdmin
      .from('team_members')
      .select('id, user_id, name, role')
      .eq('email', req.user.email)
      .eq('invite_status', 'joined')
      .single();

    if (!teamMember) {
      return res.json([]);
    }

    // Get tasks assigned to this team member
    let query = supabaseAdmin
      .from('tasks')
      .select(`
        *,
        meeting:meetings(title, created_at)
      `)
      .eq('assigned_to', teamMember.id);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update task status (team member can only update their own tasks)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Find team member record
    const { data: teamMember } = await supabaseAdmin
      .from('team_members')
      .select('id')
      .eq('email', req.user.email)
      .eq('invite_status', 'joined')
      .single();

    if (!teamMember) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Verify task is assigned to this team member
    const { data: task } = await supabaseAdmin
      .from('tasks')
      .select('assigned_to')
      .eq('id', id)
      .single();

    if (!task || task.assigned_to !== teamMember.id) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    // Update task
    const updateData = { status };
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data: updatedTask, error } = await supabaseAdmin
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log the update
    await supabaseAdmin.from('audit_logs').insert({
      user_id: task.user_id || req.user.id,
      task_id: id,
      agent_name: 'Team Member',
      action: 'Task Status Updated',
      reasoning: `Team member updated task status to ${status}`
    });

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get task details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find team member record
    const { data: teamMember } = await supabaseAdmin
      .from('team_members')
      .select('id')
      .eq('email', req.user.email)
      .eq('invite_status', 'joined')
      .single();

    if (!teamMember) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .select(`
        *,
        meeting:meetings(title, transcript, created_at)
      `)
      .eq('id', id)
      .eq('assigned_to', teamMember.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
