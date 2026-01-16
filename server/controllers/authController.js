const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sibol-secret-key-change-in-production';

const loginUser = async (req, res) => {
  const { username, password, isAdmin } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const allowedRoles = isAdmin ? ['SUPER_CHED', 'CHED_REGION'] : ['HEI_REP'];

    let query = supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('status', 'active')
      .in('role', allowedRoles)
      .limit(1);

    const { data, error } = await query;

    if (error) {
      console.error('Supabase users query error:', error.message);
      return res.status(500).json({ error: 'Server error during login: ' + error.message });
    }

    if (!data || data.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = data[0];

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      region_designation: user.region_designation,
      hei_id: user.hei_id,
      must_change_password: user.must_change_password === 1 || user.must_change_password === true
    };

    const token = jwt.sign(payload, JWT_SECRET);

    return res.status(200).json({
      token,
      user: payload
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'Server error during login: ' + err.message });
  }
};

module.exports = { loginUser };
