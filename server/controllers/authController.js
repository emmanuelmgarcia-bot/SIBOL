const pool = require('../config/db');

const loginUser = async (req, res) => {
  const { username, password, isAdmin } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    console.log(`[Auth] Checking public.profiles via Postgres for: ${username}`);

    const result = await pool.query(
      `select id, username, role, assigned_region, hei_id
       from public.profiles
       where username = $1
         and password_hash = crypt($2, password_hash)`,
      [username, password]
    );

    if (!result.rows || result.rows.length === 0) {
      console.log('Invalid username or password for:', username);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const profile = result.rows[0];
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
        hei_id: profile.hei_id
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
    await pool.query(
      `update public.profiles
       set password_hash = crypt('CHED@1994', gen_salt('bf'))
       where username = $1`,
      [username]
    );

    return res.status(200).json({ message: 'Password reset to default' });
  } catch (err) {
    console.error('Reset Password Error:', err.message);
    return res.status(500).json({ error: 'Server error during password reset: ' + err.message });
  }
};

module.exports = { loginUser, resetPasswordToDefault };
