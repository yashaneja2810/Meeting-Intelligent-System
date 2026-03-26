import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Get team error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, role, skills, slack_webhook, slack_id } = req.body;

    const { data, error } = await supabaseAdmin
      .from('team_members')
      .insert({
        user_id: req.user.id,
        name,
        email,
        role,
        skills: skills || [],
        slack_webhook,
        slack_id
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Create team member error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, skills, slack_webhook, slack_id, is_active } = req.body;

    const { data, error } = await supabaseAdmin
      .from('team_members')
      .update({
        name,
        email,
        role,
        skills,
        slack_webhook,
        slack_id,
        is_active
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Update team member error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Delete team member error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
