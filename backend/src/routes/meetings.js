import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { processTranscript } from '../services/ai.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('meetings')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, transcript } = req.body;

    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const { data: meeting, error } = await supabaseAdmin
      .from('meetings')
      .insert({
        user_id: req.user.id,
        title: title || 'Untitled Meeting',
        transcript,
        processing_status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Process transcript asynchronously
    processTranscript(meeting.id, req.user.id, transcript).catch(err => {
      console.error('Transcript processing error:', err);
    });

    res.json(meeting);
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('meetings')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
