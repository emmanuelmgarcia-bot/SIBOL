const supabase = require('../config/supabase');

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

    if (!heiName || !campus || !region || !province || !city || !barangay || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required registration fields' });
    }

    const { data, error } = await supabase
      .from('registrations')
      .insert([
        {
          hei_name: heiName,
          campus,
          region,
          province,
          city,
          barangay,
          address_line1: addressLine1 || '',
          address_line2: addressLine2 || '',
          zip_code: zipCode || '',
          first_name: firstName,
          middle_name: middleName || '',
          last_name: lastName,
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

    const { data, error } = await supabase
      .from('registrations')
      .select('id, hei_name, campus, region, first_name, middle_name, last_name, suffix, status, created_at')
      .eq('region', region)
      .order('created_at', { ascending: false });

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

    const { data: regData, error: regError } = await supabase
      .from('registrations')
      .select('hei_name, campus, region, status')
      .eq('region', region)
      .eq('status', 'Approved');

    if (regError) {
      console.error('Supabase hei directory registrations error:', regError.message);
      return res.status(500).json({ error: 'Failed to load HEI directory: ' + regError.message });
    }

    const { data: heiData, error: heiError } = await supabase
      .from('heis')
      .select('id, name, campus, region')
      .eq('region', region);

    if (heiError) {
      console.error('Supabase hei directory heis error:', heiError.message);
      return res.status(500).json({ error: 'Failed to load HEI master list: ' + heiError.message });
    }

    const grouped = {};
    const heiIndex = {};

    (heiData || []).forEach(row => {
      const key = `${(row.name || '').trim().toLowerCase()}|${(row.campus || '').trim().toLowerCase()}`;
      heiIndex[key] = row;
    });

    (regData || []).forEach(item => {
      const hei = item.hei_name;
      const campus = item.campus;
      if (!hei) {
        return;
      }
      const matchKey = `${(hei || '').trim().toLowerCase()}|${(campus || '').trim().toLowerCase()}`;
      const heiRow = heiIndex[matchKey];
      if (!heiRow) {
        return;
      }
      const groupKey = heiRow.id;
      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          heiId: heiRow.id,
          hei: heiRow.name,
          campuses: [],
          region: heiRow.region || item.region
        };
      }
      const campusValue = campus || heiRow.campus;
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

    if (rows.region !== region) {
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

    return res.status(200).json({ success: true });
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

    if (rows.region !== region) {
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
