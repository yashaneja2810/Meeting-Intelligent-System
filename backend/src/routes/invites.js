import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { sendTeamInviteEmail } from '../services/inviteNotifications.js';

const router = express.Router();

router.use(authenticate);

// Get sent invites
router.get('/sent', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('team_invites')
      .select('*')
      .eq('inviter_id', req.user.id)
      .order('invited_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Get sent invites error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get received invites
router.get('/received', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('team_invites')
      .select('*')
      .eq('invitee_email', req.user.email)
      .eq('status', 'pending')
      .order('invited_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Get received invites error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Send team invite
router.post('/send', async (req, res) => {
  try {
    const { team_member_id } = req.body;

    // Get team member details
    const { data: teamMember, error: memberError } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .eq('id', team_member_id)
      .eq('user_id', req.user.id)
      .single();

    if (memberError) throw memberError;
    if (!teamMember) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    // Get inviter details
    const { data: inviter } = await supabaseAdmin
      .from('users')
      .select('company_name')
      .eq('id', req.user.id)
      .single();

    // Check if invite already exists
    const { data: existingInvite } = await supabaseAdmin
      .from('team_invites')
      .select('id')
      .eq('inviter_id', req.user.id)
      .eq('invitee_email', teamMember.email)
      .eq('status', 'pending')
      .single();

    if (existingInvite) {
      return res.status(400).json({ error: 'Invite already sent to this email' });
    }

    // Create invite
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('team_invites')
      .insert({
        inviter_id: req.user.id,
        invitee_email: teamMember.email,
        team_member_id: team_member_id,
        company_name: inviter?.company_name || 'Your Team',
        role: teamMember.role,
        skills: teamMember.skills
      })
      .select()
      .single();

    if (inviteError) throw inviteError;

    // Update team member status
    await supabaseAdmin
      .from('team_members')
      .update({ invite_status: 'pending' })
      .eq('id', team_member_id);

    // Send email
    await sendTeamInviteEmail(teamMember.email, {
      companyName: inviter?.company_name || 'Your Team',
      role: teamMember.role,
      inviteId: invite.id
    });

    res.json(invite);
  } catch (error) {
    console.error('Send invite error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Accept invite
router.post('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;

    // Get invite
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('team_invites')
      .select('*')
      .eq('id', id)
      .eq('invitee_email', req.user.email)
      .single();

    if (inviteError) throw inviteError;
    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({ error: 'Invite already responded to' });
    }

    // Update invite
    await supabaseAdmin
      .from('team_invites')
      .update({
        status: 'accepted',
        invitee_user_id: req.user.id
      })
      .eq('id', id);

    // Update team member
    await supabaseAdmin
      .from('team_members')
      .update({
        invite_status: 'joined',
        email: req.user.email // Update with actual user email
      })
      .eq('id', invite.team_member_id);

    res.json({ message: 'Invite accepted successfully' });
  } catch (error) {
    console.error('Accept invite error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Reject invite
router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;

    // Get invite
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('team_invites')
      .select('*')
      .eq('id', id)
      .eq('invitee_email', req.user.email)
      .single();

    if (inviteError) throw inviteError;
    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({ error: 'Invite already responded to' });
    }

    // Update invite
    await supabaseAdmin
      .from('team_invites')
      .update({ status: 'rejected' })
      .eq('id', id);

    // Update team member
    await supabaseAdmin
      .from('team_members')
      .update({ invite_status: 'not_invited' })
      .eq('id', invite.team_member_id);

    res.json({ message: 'Invite rejected' });
  } catch (error) {
    console.error('Reject invite error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
