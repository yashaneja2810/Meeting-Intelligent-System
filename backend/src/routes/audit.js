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

export default router;
