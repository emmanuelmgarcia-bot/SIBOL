const supabase = require('../config/supabase');

const loginUser = async (req, res) => {
  const { username, isAdmin } = req.body; // ignoring password for a moment to test connection

  try {
    console.log(`[Auth] Checking public.profiles for: ${username}`);

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .limit(1);

    if (error) {
      console.error('Supabase query error:', error.message);
      return res.status(500).json({ error: 'Server error during login: ' + error.message });
    }

    if (!profiles || profiles.length === 0) {
      console.log("User not found in profiles table.");
      return res.status(401).json({ error: 'User not found in database' });
    }

    const profile = profiles[0];
    console.log("User found:", profile.username);

    // 2. SECURITY CHECK
    if (isAdmin && profile.role !== 'admin') {
      return res.status(403).json({ error: 'Access Denied: Not an Admin.' });
    }

    // 3. SUCCESS (Bypassing password check temporarily to prove DB works)
    res.status(200).json({
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
    console.error("Login Error:", err.message); // <--- LOOK AT THIS LINE IN YOUR TERMINAL
    res.status(500).json({ error: 'Server error during login: ' + err.message });
  }
};

module.exports = { loginUser };
