import { supabase, supabaseAdmin } from '../config/supabase.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Check if user profile exists, create if not (with conflict handling)
    const { data: profile, error: selectError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profile && !selectError) {
      // Profile doesn't exist, try to create it
      try {
        const { error: insertError } = await supabaseAdmin
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            display_name: user.email.split('@')[0]
          });
        
        // Ignore duplicate key errors (profile was created by another request)
        if (insertError && !insertError.message.includes('duplicate key')) {
          console.error('Profile creation error:', insertError);
        }
      } catch (insertErr) {
        // Silently ignore duplicate key errors
        if (!insertErr.message.includes('duplicate key')) {
          console.error('Profile creation error:', insertErr);
        }
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};
