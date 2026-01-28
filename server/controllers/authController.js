const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

const loginUser = async (req, res) => {
  const { username, password, isAdmin } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    if (isAdmin) {
      console.log(`[Auth] Checking public.profiles for admin: ${username}`);

      const { data, error } = await supabase.rpc('login_profile', {
        p_username: username,
        p_password: password
      });

      if (error) {
        console.error('Supabase login_profile error:', error.message);
        return res.status(500).json({ error: 'Server error during login: ' + error.message });
      }

      if (!data || data.length === 0) {
        console.log('Invalid admin username or password for:', username);
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const profile = data[0];
      console.log('Admin user found:', profile.username);

      if (profile.role !== 'admin' && profile.role !== 'superadmin') {
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
    }

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
      console.log('No approved registration found for username:', username);
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

    const addressParts = [province, city, barangay, addressLine1, addressLine2, zipCode].filter(Boolean);
    const address = addressParts.join(', ');

    if (heiName) {
      let heiQuery = supabase
        .from('heis')
        .select('id')
        .eq('name', heiName);

      if (campusName) {
        heiQuery = heiQuery.eq('campus_name', campusName);
      }

      if (regionName) {
        heiQuery = heiQuery.eq('region_destination', regionName);
      }

      const { data: heiRows, error: heiError } = await heiQuery.limit(1);
      if (heiError) {
        console.error('Supabase fetch HEI during login error:', heiError.message);
      } else if (heiRows && heiRows.length > 0) {
        heiId = heiRows[0].id;
      }

      if (!heiId) {
         // Removed loose fallback to prevent merging different campuses
      }

      if (!heiId) {
        const insertPayload = {
          name: heiName,
          campus_name: campusName || null,
          address: address || null,
          region_destination: regionName || null,
          academic_year: null
        };
        const { data: insertedHeis, error: heiInsertError } = await supabase
          .from('heis')
          .insert([insertPayload])
          .select('id')
          .single();
        if (heiInsertError) {
          console.error('Insert HEI error during login:', heiInsertError.message);
          if (!heiId) {
            const { data: afterErrorRows, error: afterErrorFetch } = await supabase
              .from('heis')
              .select('id')
              .ilike('name', heiName)
              .limit(1);
            if (afterErrorFetch) {
              console.error('Supabase post-insert HEI fetch during login error:', afterErrorFetch.message);
            } else if (afterErrorRows && afterErrorRows.length > 0) {
              heiId = afterErrorRows[0].id;
            }
          }
        } else if (insertedHeis && insertedHeis.id) {
          heiId = insertedHeis.id;
        }
      }
    } else if (campusName && regionName) {
      const { data: heiRowsByCampus, error: heiCampusError } = await supabase
        .from('heis')
        .select('id')
        .eq('campus_name', campusName)
        .eq('region_destination', regionName)
        .limit(1);
      if (heiCampusError) {
        console.error('Supabase fetch HEI by campus/region during login error:', heiCampusError.message);
      } else if (heiRowsByCampus && heiRowsByCampus.length > 0) {
        heiId = heiRowsByCampus[0].id;
      }

      if (!heiId) {
        const campusHeiName = heiName || `${campusName} - ${regionName}`;
        const insertPayload = {
          name: campusHeiName,
          campus_name: campusName || null,
          address: address || null,
          region_destination: regionName || null,
          academic_year: null
        };
        const { data: insertedCampusHeis, error: insertCampusError } = await supabase
          .from('heis')
          .insert([insertPayload])
          .select('id')
          .single();
        if (insertCampusError) {
          console.error('Insert HEI for campus/region during login error:', insertCampusError.message);
          const { data: afterCampusRows, error: afterCampusFetch } = await supabase
            .from('heis')
            .select('id')
            .ilike('name', campusHeiName)
            .limit(1);
          if (afterCampusFetch) {
            console.error('Post-insert HEI fetch for campus/region during login error:', afterCampusFetch.message);
          } else if (afterCampusRows && afterCampusRows.length > 0) {
            heiId = afterCampusRows[0].id;
          }
        } else if (insertedCampusHeis && insertedCampusHeis.id) {
          heiId = insertedCampusHeis.id;
        }
      }
    }

    if (!heiId) {
      console.error('Missing HEI ID for registration during login:', {
        registrationId: reg.id,
        hei_name: reg.hei_name
      });
      return res.status(500).json({
        error: 'HEI configuration is incomplete for this account. Please contact CHED to fix the HEI record.'
      });
    }

    return res.status(200).json({
      message: 'Login successful',
      token: 'mock-token',
      user: {
        id: reg.id,
        username: reg.username,
        role: 'hei',
        assigned_region: reg.region,
        hei_id: heiId,
        must_change_password: !!reg.is_first_login
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
    if (isAdmin) {
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
    }

    const { data: regRows, error: regError } = await supabase
      .from('registrations')
      .select('id, username, password_hash, hei_name, region, is_first_login')
      .eq('id', userId)
      .eq('username', username)
      .eq('status', 'Approved')
      .limit(1);

    if (regError) {
      console.error('Supabase registrations fetch during update error:', regError.message);
      return res.status(500).json({ error: 'Server error during credential verification: ' + regError.message });
    }

    if (!regRows || regRows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const reg = regRows[0];

    if (!reg.password_hash) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const passwordOk = await bcrypt.compare(currentPassword, reg.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const updatePayload = {};
    if (newUsername && newUsername !== username) {
      updatePayload.username = newUsername;
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    updatePayload.password_hash = newHash;
    updatePayload.is_first_login = false;

    const { error: regUpdateError } = await supabase
      .from('registrations')
      .update(updatePayload)
      .eq('id', userId);

    if (regUpdateError) {
      console.error('Supabase registrations update credentials error:', regUpdateError.message);
      return res.status(500).json({ error: 'Server error during credential update: ' + regUpdateError.message });
    }

    const { data: updatedRows, error: regFetchError2 } = await supabase
      .from('registrations')
      .select('id, username, hei_name, region, is_first_login')
      .eq('id', userId)
      .limit(1);

    if (regFetchError2) {
      console.error('Supabase registrations refetch after update error:', regFetchError2.message);
      return res.status(500).json({ error: 'Server error loading updated account: ' + regFetchError2.message });
    }

    const updated = updatedRows && updatedRows[0] ? updatedRows[0] : reg;

    let heiId = null;
    if (updated.hei_name) {
      const { data: heiRows, error: heiError } = await supabase
        .from('heis')
        .select('id')
        .eq('name', updated.hei_name)
        .limit(1);
      if (heiError) {
        console.error('Supabase fetch HEI during credential update error:', heiError.message);
      } else if (heiRows && heiRows.length > 0) {
        heiId = heiRows[0].id;
      }
    }

    return res.status(200).json({
      message: 'Credentials updated successfully',
      token: 'mock-token',
      user: {
        id: updated.id,
        username: updated.username,
        role: 'hei',
        assigned_region: updated.region,
        hei_id: heiId,
        must_change_password: !!updated.is_first_login
      }
    });
  } catch (err) {
    console.error('Update Credentials Error:', err.message);
    return res.status(500).json({ error: 'Server error during credential update: ' + err.message });
  }
};

module.exports = { loginUser, resetPasswordToDefault, updateCredentials };
