import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { status, assigned_to } = req.query;

    let query = supabaseAdmin
      .from('tasks')
      .select(`
        *,
        assigned_member:team_members(id, name, email, role)
      `)
      .eq('user_id', req.user.id);

    if (status) {
      query = query.eq('status', status);
    }

    if (assigned_to) {
      query = query.eq('assigned_to', assigned_to);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .select(`
        *,
        assigned_member:team_members(id, name, email, role)
      `)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_to, priority, deadline } = req.body;

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
    if (priority !== undefined) updateData.priority = priority;
    if (deadline !== undefined) updateData.deadline = deadline;

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id/reassign', async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, reason } = req.body;

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update({
        assigned_to,
        assignment_reason: reason || 'Manual reassignment'
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    // Log the reassignment
    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.user.id,
      task_id: id,
      agent_name: 'Manual',
      action: 'Task Reassigned',
      reasoning: reason || 'Manual reassignment by user'
    });

    res.json(data);
  } catch (error) {
    console.error('Reassign task error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
