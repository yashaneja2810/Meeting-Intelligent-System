import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { task_id, agent_name, limit = 100 } = req.query;

    let query = supabaseAdmin
      .from('audit_logs')
      .select('*')
      .eq('user_id', req.user.id);

    if (task_id) {
      query = query.eq('task_id', task_id);
    }

    if (agent_name) {
      query = query.eq('agent_name', agent_name);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete a single audit log
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify the log belongs to the user
    const { data: log } = await supabaseAdmin
      .from('audit_logs')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!log || log.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this log' });
    }

    const { error } = await supabaseAdmin
      .from('audit_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Audit log deleted' });
  } catch (error) {
    console.error('Delete audit log error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Clear all audit logs for the user
router.delete('/', async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('audit_logs')
      .delete()
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ success: true, message: 'All audit logs cleared' });
  } catch (error) {
    console.error('Clear audit logs error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
