const supabase = require('../config/supabase');

const loginUser = async (req, res) => {
  const { username, password, isAdmin } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    console.log(`[Auth] Checking public.profiles for: ${username}`);

    const { data, error } = await supabase.rpc('login_profile', {
      p_username: username,
      p_password: password
    });

    if (error) {
      console.error('Supabase login_profile error:', error.message);
      return res.status(500).json({ error: 'Server error during login: ' + error.message });
    }

    if (!data || data.length === 0) {
      console.log('Invalid username or password for:', username);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const profile = data[0];
    console.log('User found:', profile.username);

    if (isAdmin && profile.role !== 'admin') {
      return res.status(403).json({ error: 'Access Denied: Not an Admin.' });
    }

    return res.status(200).json({
      message: 'Login successful',
      token: 'mock-token',
      user: {
        id: profile.id,
        username: profile.username,
        role: profile.role,
        assigned_region: profile.assigned_region,
        hei_id: profile.hei_id,
        must_change_password: profile.must_change_password
      }
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    return res.status(500).json({ error: 'Server error during login: ' + err.message });
  }
};

const resetPasswordToDefault = async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const { error } = await supabase.rpc('reset_password_default', {
      p_username: username
    });

    if (error) {
      console.error('Supabase reset_password_default error:', error.message);
      return res.status(500).json({ error: 'Server error during password reset: ' + error.message });
    }

    return res.status(200).json({ message: 'Password reset to default' });
  } catch (err) {
    console.error('Reset Password Error:', err.message);
    return res.status(500).json({ error: 'Server error during password reset: ' + err.message });
  }
};

const updateCredentials = async (req, res) => {
  const { userId, username, newUsername, currentPassword, newPassword, isAdmin } = req.body;

  if (!userId || !username || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  try {
    const { data, error } = await supabase.rpc('login_profile', {
      p_username: username,
      p_password: currentPassword
    });

    if (error) {
      console.error('Supabase login_profile error during update:', error.message);
      return res.status(500).json({ error: 'Server error during credential verification: ' + error.message });
    }

    if (!data || data.length === 0) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const { error: updateError } = await supabase.rpc('update_profile_credentials', {
      p_user_id: userId,
      p_new_username: newUsername || null,
      p_new_password: newPassword,
      p_is_admin: !!isAdmin
    });

    if (updateError) {
      console.error('Supabase update_profile_credentials error:', updateError.message);
      return res.status(500).json({ error: 'Server error during credential update: ' + updateError.message });
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, role, assigned_region, hei_id, must_change_password')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Supabase select profiles error:', profileError.message);
      return res.status(500).json({ error: 'Server error loading updated profile: ' + profileError.message });
    }

    return res.status(200).json({
      message: 'Credentials updated successfully',
      token: 'mock-token',
      user: profileData
    });
  } catch (err) {
    console.error('Update Credentials Error:', err.message);
    return res.status(500).json({ error: 'Server error during credential update: ' + err.message });
  }
};

module.exports = { loginUser, resetPasswordToDefault, updateCredentials };
