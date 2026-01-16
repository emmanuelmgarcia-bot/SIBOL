const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

const createRegistration = async (req, res) => {
  try {
    const {
      heiName,
      campus,
      region,
      province,
      city,
      barangay,
      addressLine1,
      addressLine2,
      zipCode,
      firstName,
      middleName,
      lastName,
      suffix
    } = req.body;

    const cleanedHeiName = (heiName || '').trim();
    const cleanedCampus = (campus || '').trim();
    const cleanedRegion = (region || '').trim();
    const cleanedProvince = (province || '').trim();
    const cleanedCity = (city || '').trim();
    const cleanedBarangay = (barangay || '').trim();
    const cleanedFirstName = (firstName || '').trim();
    const cleanedLastName = (lastName || '').trim();

    if (!cleanedHeiName || !cleanedCampus || !cleanedRegion || !cleanedProvince || !cleanedCity || !cleanedBarangay || !cleanedFirstName || !cleanedLastName) {
      return res.status(400).json({ error: 'Missing required registration fields' });
    }

    const { data, error } = await supabase
      .from('registrations')
      .insert([
        {
          hei_name: cleanedHeiName,
          campus: cleanedCampus,
          region: cleanedRegion,
          province: cleanedProvince,
          city: cleanedCity,
          barangay: cleanedBarangay,
          address_line1: addressLine1 || '',
          address_line2: addressLine2 || '',
          zip_code: zipCode || '',
          first_name: cleanedFirstName,
          middle_name: middleName || '',
          last_name: cleanedLastName,
          suffix: suffix || '',
          status: 'For Approval'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase create registration error:', error.message);
      return res.status(500).json({ error: 'Failed to save registration: ' + error.message });
    }

    try {
      const heiNameForHei = (data.hei_name || '').trim();
      const campusForHei = (data.campus || '').trim();
      const regionForHei = (data.region || '').trim();

      if (heiNameForHei) {
        let heiQuery = supabase
          .from('heis')
          .select('id')
          .eq('name', heiNameForHei);

        if (campusForHei) {
          heiQuery = heiQuery.eq('campus', campusForHei);
        }

        if (regionForHei) {
          heiQuery = heiQuery.eq('region', regionForHei);
        }

        const { data: existingHeis, error: heiFetchError } = await heiQuery.limit(1);

        if (heiFetchError) {
          console.error('Supabase fetch HEI during registration create error:', heiFetchError.message);
        } else if (!existingHeis || existingHeis.length === 0) {
          const insertPayload = {
            name: heiNameForHei
          };
          if (campusForHei) {
            insertPayload.campus = campusForHei;
          }
          if (regionForHei) {
            insertPayload.region = regionForHei;
          }

          const { error: heiInsertError } = await supabase
            .from('heis')
            .insert([insertPayload]);

          if (heiInsertError) {
            console.error('Supabase insert HEI during registration create error:', heiInsertError.message);
          }
        }
      }
    } catch (heiErr) {
      console.error('HEI sync during registration create exception:', heiErr.message);
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error('Create registration exception:', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

const listRegistrationsByRegion = async (req, res) => {
  try {
    const { region } = req.query;

    if (!region) {
      return res.status(400).json({ error: 'Region is required' });
    }

    let query = supabase
      .from('registrations')
      .select('id, hei_name, campus, region, first_name, middle_name, last_name, suffix, status');

    if (region !== 'ALL') {
      query = query.eq('region', region);
    }

    const { data, error } = await query
      .order('id', { ascending: false });

    if (error) {
      console.error('Supabase list registrations error:', error.message);
      return res.status(500).json({ error: 'Failed to load registrations: ' + error.message });
    }

    return res.status(200).json(data || []);
  } catch (err) {
    console.error('List registrations exception:', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

const listHeiCampusesByRegion = async (req, res) => {
  try {
    const { region } = req.query;

    if (!region) {
      return res.status(400).json({ error: 'Region is required' });
    }

    let regQuery = supabase
      .from('registrations')
      .select('hei_name, campus, region, status')
      .eq('status', 'Approved');

    if (region !== 'ALL') {
      regQuery = regQuery.eq('region', region);
    }

    const { data: regData, error: regError } = await regQuery;

    if (regError) {
      console.error('Supabase hei directory registrations error:', regError.message);
      return res.status(500).json({ error: 'Failed to load HEI directory: ' + regError.message });
    }

    let heiQuery = supabase
      .from('heis')
      .select('id, name');

    const { data: heiData, error: heiError } = await heiQuery;

    if (heiError) {
      console.error('Supabase hei directory heis error:', heiError.message);
      return res.status(500).json({ error: 'Failed to load HEI master list: ' + heiError.message });
    }

    const grouped = {};
    const heiIndex = {};

    (heiData || []).forEach(row => {
      const key = (row.name || '').trim().toLowerCase();
      heiIndex[key] = row;
    });

    (regData || []).forEach(item => {
      const hei = item.hei_name;
      const campus = item.campus;
      if (!hei) {
        return;
      }
      const matchKey = (hei || '').trim().toLowerCase();
      const heiRow = heiIndex[matchKey];
      const groupKey = (heiRow && heiRow.id) ? heiRow.id : matchKey;
      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          id: heiRow ? heiRow.id : null,
          heiId: heiRow ? heiRow.id : null,
          hei: heiRow ? heiRow.name : hei,
          campuses: [],
          region: item.region
        };
      }
      const campusValue = campus;
      if (campusValue && !grouped[groupKey].campuses.includes(campusValue)) {
        grouped[groupKey].campuses.push(campusValue);
      }
    });

    Object.values(grouped).forEach(entry => {
      entry.campuses.sort((a, b) => a.localeCompare(b));
    });

    const list = Object.values(grouped).sort((a, b) => a.hei.localeCompare(b.hei));

    return res.status(200).json(list);
  } catch (err) {
    console.error('List HEI campuses exception:', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};
const approveRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { region } = req.body;

    if (!region) {
      return res.status(400).json({ error: 'Region is required to approve registration' });
    }

    const { data: rows, error: fetchError } = await supabase
      .from('registrations')
      .select('id, region, hei_name, campus, first_name')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Fetch registration error:', fetchError.message);
      return res.status(500).json({ error: 'Failed to load registration: ' + fetchError.message });
    }

    if (!rows) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (region !== 'ALL' && rows.region !== region) {
      return res.status(403).json({ error: 'Not allowed to approve registration from another region' });
    }

    const { error: updateError } = await supabase
      .from('registrations')
      .update({ status: 'Approved' })
      .eq('id', id);

    if (updateError) {
      console.error('Approve registration error:', updateError.message);
      return res.status(500).json({ error: 'Failed to approve registration: ' + updateError.message });
    }

    const heiNameRaw = rows.hei_name || '';
    const campusRaw = rows.campus || '';
    const firstNameRaw = rows.first_name || '';
    const heiName = heiNameRaw.trim();
    const campusName = campusRaw.trim();
    const repFirstName = firstNameRaw.trim();

    let heiId = null;
    if (heiName) {
      const { data: existingHeis, error: heiFetchError } = await supabase
        .from('heis')
        .select('id')
        .eq('name', heiName)
        .limit(1);

      if (heiFetchError) {
        console.error('Fetch HEI error during approval:', heiFetchError.message);
      } else if (existingHeis && existingHeis.length > 0) {
        heiId = existingHeis[0].id;
      }

      if (!heiId) {
        const { data: fuzzyRows, error: fuzzyError } = await supabase
          .from('heis')
          .select('id, name')
          .ilike('name', `%${heiName}%`)
          .limit(1);
        if (fuzzyError) {
          console.error('Fuzzy fetch HEI error during approval:', fuzzyError.message);
        } else if (fuzzyRows && fuzzyRows.length > 0) {
          heiId = fuzzyRows[0].id;
        }
      }

      if (!heiId) {
        const insertPayload = {
          name: heiName
        };
        if (campusName) {
          insertPayload.campus = campusName;
        }
        if (rows.region) {
          insertPayload.region = rows.region;
        }
        const { data: insertedHeis, error: heiInsertError } = await supabase
          .from('heis')
          .insert([insertPayload])
          .select('id')
          .single();
        if (heiInsertError) {
          console.error('Insert HEI error during approval:', heiInsertError.message);
        } else if (insertedHeis && insertedHeis.id) {
          heiId = insertedHeis.id;
        }
      }
    }

    let createdUsername = null;
    let base = repFirstName;

    if (!base) {
      const baseParts = [];
      if (heiName) {
        baseParts.push(heiName);
      }
      if (campusName) {
        baseParts.push(campusName);
      }
      base = baseParts.join(' ');
    }

    let candidate = base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    if (!candidate) {
      candidate = `hei_${String(heiId || rows.id).replace(/[^a-z0-9]/gi, '').slice(0, 8).toLowerCase()}`;
    }

    let username = candidate;
    for (let i = 0; i < 5; i++) {
      const trial = i === 0 ? username : `${candidate}${i + 1}`;
      const { data: existingRegs, error: regFetchError } = await supabase
        .from('registrations')
        .select('id')
        .eq('username', trial)
        .limit(1);
      if (regFetchError) {
        console.error('Fetch registration username error during approval:', regFetchError.message);
        break;
      }
      if (!existingRegs || existingRegs.length === 0) {
        username = trial;
        createdUsername = username;
        break;
      }
    }

    if (createdUsername) {
      try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('CHED@1994', salt);
        const { error: regUpdateError } = await supabase
          .from('registrations')
          .update({
            username: createdUsername,
            password_hash: passwordHash,
            is_first_login: true
          })
          .eq('id', id);
        if (regUpdateError) {
          console.error('Update registration credentials error during approval:', regUpdateError.message);
        }
      } catch (hashError) {
        console.error('Password hash error during approval:', hashError.message);
      }
    }

    return res.status(200).json({ success: true, username: createdUsername || null });
  } catch (err) {
    console.error('Approve registration exception:', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

const deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { region } = req.body;

    if (!region) {
      return res.status(400).json({ error: 'Region is required to delete registration' });
    }

    const { data: rows, error: fetchError } = await supabase
      .from('registrations')
      .select('id, region')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Fetch registration error:', fetchError.message);
      return res.status(500).json({ error: 'Failed to load registration: ' + fetchError.message });
    }

    if (!rows) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (region !== 'ALL' && rows.region !== region) {
      return res.status(403).json({ error: 'Not allowed to delete registration from another region' });
    }

    const { error: deleteError } = await supabase
      .from('registrations')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete registration error:', deleteError.message);
      return res.status(500).json({ error: 'Failed to delete registration: ' + deleteError.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Delete registration exception:', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

module.exports = {
  createRegistration,
  listRegistrationsByRegion,
  listHeiCampusesByRegion,
  approveRegistration,
  deleteRegistration
};
