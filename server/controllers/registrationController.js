const supabase = require('../config/supabase');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

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

const loadHeiDirectoryFromCsv = () => {
  return new Promise((resolve, reject) => {
    const csvPath = path.join(__dirname, '..', 'data', 'Campus_list.csv');
    if (!fs.existsSync(csvPath)) {
      reject(new Error('Campus_list.csv not found'));
      return;
    }
    const mapping = {};
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', row => {
        const rawName = row['HEI Name'];
        const rawCampus = row['Campus'];
        if (!rawName) {
          return;
        }
        const heiName = String(rawName).trim();
        const campusName = rawCampus ? String(rawCampus).trim() : '';
        if (!heiName) {
          return;
        }
        if (!mapping[heiName]) {
          mapping[heiName] = [];
        }
        if (campusName && !mapping[heiName].includes(campusName)) {
          mapping[heiName].push(campusName);
        }
      })
      .on('end', () => {
        const list = Object.keys(mapping)
          .sort((a, b) => a.localeCompare(b))
          .map(heiName => {
            const campuses = mapping[heiName].slice().sort((a, b) => a.localeCompare(b));
            return {
              hei: heiName,
              campuses
            };
          });
        resolve(list);
      })
      .on('error', err => {
        reject(err);
      });
  });
};

const listHeiCampusesByRegion = async (req, res) => {
  try {
    const { region } = req.query;

    if (!region) {
      return res.status(400).json({ error: 'Region is required' });
    }

    const list = await loadHeiDirectoryFromCsv();
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
