import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/profile', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const { display_name, company_name, preferences } = req.body;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        display_name,
        company_name,
        preferences
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/complete-onboarding', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ onboarding_completed: true })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
