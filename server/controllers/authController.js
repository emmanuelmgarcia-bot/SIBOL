const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

const loginUser = async (req, res) => {
  // Removed isAdmin from destructuring - we will detect it automatically
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // 1. Attempt Admin Login (public.profiles)
    console.log(`[Auth] Checking public.profiles for: ${username}`);
    const { data: adminData, error: adminError } = await supabase.rpc('login_profile', {
      p_username: username,
      p_password: password
    });

    if (adminError) {
      console.error('Supabase login_profile error:', adminError.message);
      // Don't return error yet, try HEI login unless it's a critical DB failure
      // But usually RPC error means something is wrong with the query or DB connection.
      // However, if the user just doesn't exist in profiles (and logic is inside RPC), it returns empty table, not error.
      // If RPC fails (e.g. function not found), we might want to log it.
    }

    if (adminData && adminData.length > 0) {
      const profile = adminData[0];
      console.log('Admin user found:', profile.username);

      // It's an admin/superadmin
      if (profile.role === 'admin' || profile.role === 'superadmin') {
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
      }
    }

    // 2. Attempt HEI Login (public.registrations)
    console.log(`[Auth] Checking public.registrations for: ${username}`);
    const { data: regRows, error: regError } = await supabase
      .from('registrations')
      .select('id, hei_name, campus, region, province, city, barangay, address_line1, address_line2, zip_code, username, password_hash, is_first_login')
      .eq('username', username)
      .eq('status', 'Approved')
      .limit(1);

    if (regError) {
      console.error('Supabase registrations login error:', regError.message);
      return res.status(500).json({ error: 'Server error during login: ' + regError.message });
    }

    if (!regRows || regRows.length === 0) {
      // Failed both checks
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const reg = regRows[0];

    if (!reg.password_hash) {
      console.log('Missing password hash for registration username:', username);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const passwordOk = await bcrypt.compare(password, reg.password_hash);
    if (!passwordOk) {
      console.log('Invalid password for registration username:', username);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // HEI Logic
    let heiId = null;
    const heiNameRaw = reg.hei_name || '';
    const campusRaw = reg.campus || '';
    const regionRaw = reg.region || '';
    const provinceRaw = reg.province || '';
    const cityRaw = reg.city || '';
    const barangayRaw = reg.barangay || '';
    const addr1Raw = reg.address_line1 || '';
    const addr2Raw = reg.address_line2 || '';
    const zipRaw = reg.zip_code || '';

    const heiName = heiNameRaw.trim();
    const campusName = campusRaw.trim();
    const regionName = regionRaw.trim();
    const province = provinceRaw.trim();
    const city = cityRaw.trim();
    const barangay = barangayRaw.trim();
    const addressLine1 = addr1Raw.trim();
    const addressLine2 = addr2Raw.trim();
    const zipCode = zipRaw.trim();

    // Find HEI ID
    const { data: heiList, error: heiListError } = await supabase
      .from('hei')
      .select('id, name, campus_name, region')
      .ilike('name', heiName) // Case-insensitive match for HEI name
      .limit(10); // Fetch potential matches

    if (heiListError) {
      console.error('Error fetching HEI list:', heiListError);
    } else {
       // Filter in memory for exact campus/region match to be safe
       const exactMatch = heiList.find(h => 
          (h.campus_name || '').trim().toLowerCase() === campusName.toLowerCase() &&
          (h.region || '').trim().toLowerCase() === regionName.toLowerCase()
       );

       if (exactMatch) {
          heiId = exactMatch.id;
       } else {
          // Try loose match if strict failed (fallback, but strict preferred)
          // Actually, we recently tightened this. Let's stick to tight matching logic.
          // If no match found, heiId remains null.
          console.log(`Warning: No exact HEI match for ${heiName} - ${campusName} in ${regionName}`);
       }
    }

    return res.status(200).json({
      message: 'Login successful',
      token: 'mock-token',
      user: {
        id: reg.id,
        username: reg.username,
        role: 'hei', // Explicitly set role
        is_first_login: reg.is_first_login,
        // Include HEI details
        hei_id: heiId,
        hei_name: heiName,
        campus: campusName,
        region: regionName,
        province: province,
        city: city,
        barangay: barangay,
        address_line1: addressLine1,
        address_line2: addressLine2,
        zip_code: zipCode
      }
    });

  } catch (err) {
    console.error('Login exception:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const resetPasswordToDefault = async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const { data: regRows, error: regError } = await supabase
      .from('registrations')
      .select('id')
      .eq('username', username)
      .eq('status', 'Approved')
      .limit(1);

    if (regError) {
      console.error('Supabase error:', regError);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!regRows || regRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = regRows[0].id;
    const defaultPassword = 'CHED@1994';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(defaultPassword, salt);

    const { error: updateError } = await supabase
      .from('registrations')
      .update({ 
        password_hash: hash,
        is_first_login: true 
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Update error:', updateError);
      return res.status(500).json({ error: 'Failed to reset password' });
    }

    return res.status(200).json({ message: 'Password reset to CHED@1994' });

  } catch (err) {
    console.error('Reset password exception:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const updateCredentials = async (req, res) => {
  const { userId, username, newUsername, currentPassword, newPassword, isAdmin } = req.body;

  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const table = isAdmin ? 'profiles' : 'registrations';
    
    // 1. Verify current password
    // Need to fetch password hash first
    let userRecord;
    
    if (isAdmin) {
      // For profiles (admin)
      // Note: profiles table stores password_hash if I remember correctly from RPC
      // Wait, in schema, profiles might not be directly queryable for password?
      // The login RPC handles it. But for update, we need to verify.
      // Let's assume we can select password_hash from profiles if RLS allows or service key used (we use supabase client which has service role usually in backend? No, it's public client?)
      // Wait, `server/config/supabase.js` usually initializes with service key?
      // Let's check config/supabase.js to be sure.
      
      const { data, error } = await supabase
        .from('profiles')
        .select('password_hash')
        .eq('id', userId)
        .single();
        
      if (error || !data) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Profiles uses `crypt` extension usually. 
      // If we use bcrypt here, we need to match how it's stored.
      // The `login_profile` RPC used `crypt(p_password, p_password_hash)`.
      // So profiles table uses pgcrypto `crypt`.
      // We cannot easily verify with bcrypt if it's pgcrypto.
      // We should use an RPC to verify and update password for profiles.
      
      // However, for now, let's implement HEI logic (registrations) which uses bcrypt.
      // Admin password update might fail if I use bcrypt on pgcrypto hash.
      // Let's assume Admin password update uses a different mechanism or I need an RPC.
      // Checking `recreate_schema.sql` -> `create extension if not exists pgcrypto;`
      // So Admin uses pgcrypto.
      
      // I'll create a new RPC `update_admin_password` or similar if needed.
      // But for now, let's handle HEI first.
      
      // Actually, if I can't easily verify admin password without RPC, I might have to skip verification or use RPC.
      // Let's implement HEI (registrations) first.
      
      if (isAdmin) {
         // Admin update logic - reusing existing pattern if any
         // If no RPC exists, we can try to update directly using `crypt` in SQL query?
         // Supabase JS client doesn't support raw SQL easily without RPC.
         
         // Let's try to find if there is an existing `update_profile` RPC.
         // If not, I'll return 501 Not Implemented for Admin for now, or try to use `rpc`.
         
         // Wait, the user asked for "consolidated single login". 
         // I should ensure `updateCredentials` works for both.
         
         // Let's assume `update_profile_password` RPC exists or I'll add it.
         // For now, I'll focus on HEI which is critical for the user's "registrations" context.
         
         // Or I can just blindly update if I trust the user is authenticated? No, "currentPassword" is required.
         
         // Let's implement a simple verify logic: try login again with current password!
         const { data: loginData, error: loginError } = await supabase.rpc('login_profile', {
            p_username: username,
            p_password: currentPassword
         });
         
         if (loginError || !loginData || loginData.length === 0) {
            return res.status(401).json({ error: 'Incorrect current password' });
         }
         
         // Verification success. Now update.
         // We need to hash new password with pgcrypto `crypt`.
         // `update profiles set password_hash = crypt(new_password, gen_salt('bf')) where id = ...`
         // I can't do this with simple `.update()`.
         
         // I will create a new RPC `update_admin_password` via SQL if I can.
         // But I am editing JS file now.
         
         // Let's look at `registrations` (HEI). It uses bcrypt.
         return res.status(501).json({ error: "Admin password update not fully implemented in this unified controller yet." });
      }
      
    } else {
       // HEI (registrations)
       const { data, error } = await supabase
        .from('registrations')
        .select('password_hash')
        .eq('id', userId)
        .single();
        
       if (error || !data) {
         return res.status(404).json({ error: 'User not found' });
       }
       
       const valid = await bcrypt.compare(currentPassword, data.password_hash);
       if (!valid) {
         return res.status(401).json({ error: 'Incorrect current password' });
       }
       
       // Update
       const salt = await bcrypt.genSalt(10);
       const hash = await bcrypt.hash(newPassword, salt);
       
       const updates = {
         password_hash: hash,
         is_first_login: false
       };
       
       if (newUsername) {
         updates.username = newUsername;
       }
       
       const { data: updatedUser, error: updateError } = await supabase
         .from('registrations')
         .update(updates)
         .eq('id', userId)
         .select()
         .single();
         
       if (updateError) {
         return res.status(500).json({ error: 'Update failed: ' + updateError.message });
       }
       
       return res.status(200).json({
         message: 'Credentials updated',
         user: {
            ...updatedUser,
            role: 'hei'
         }
       });
    }

  } catch (err) {
    console.error('Update credentials exception:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { loginUser, resetPasswordToDefault, updateCredentials };
