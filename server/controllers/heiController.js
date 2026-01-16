const supabase = require('../config/supabase');
const { uploadBase64File } = require('../config/googleDrive');

const getAllHeis = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('heis')
      .select('id, name, campus, region')
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase HEI query error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const uploadSubmission = async (req, res) => {
  try {
    const { heiId, campus, formType, fileName, mimeType, fileBase64 } = req.body;
    if (!heiId || !campus || !formType || !fileName || !mimeType || !fileBase64) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || undefined;
    const fileData = await uploadBase64File({
      fileName,
      mimeType,
      dataBase64: fileBase64,
      folderId
    });
    let dbSaved = false;
    try {
      const { error } = await supabase
        .from('submissions')
        .insert([
          {
            hei_id: heiId,
            campus,
            form_type: formType,
            file_id: fileData.id,
            file_name: fileName
          }
        ]);
      if (!error) {
        dbSaved = true;
      } else {
        console.error('Supabase submission insert error:', error.message);
      }
    } catch (dbErr) {
      console.error('Supabase submission insert exception:', dbErr.message);
    }
    return res.status(201).json({
      fileId: fileData.id,
      webViewLink: fileData.webViewLink || null,
      webContentLink: fileData.webContentLink || null,
      dbSaved
    });
  } catch (err) {
    console.error('Upload submission error:', err.message);
    if (err.message && err.message.includes('Google service account credentials')) {
      return res.status(500).json({ error: 'Google Drive credentials are not configured on the server' });
    }
    return res.status(500).json({ error: 'Failed to upload submission' });
  }
};

const getSubmissions = async (req, res) => {
  try {
    const { heiId, campus, formType } = req.query;
    if (!heiId) {
      return res.status(400).json({ error: 'heiId is required' });
    }
    let query = supabase
      .from('submissions')
      .select('id, hei_id, campus, form_type, file_name, created_at')
      .eq('hei_id', heiId)
      .order('created_at', { ascending: false });

    if (campus) {
      query = query.eq('campus', campus);
    }
    if (formType) {
      query = query.eq('form_type', formType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase submissions query error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data || []);
  } catch (err) {
    console.error('Get submissions error:', err.message);
    return res.status(500).json({ error: 'Failed to load submissions' });
  }
};

module.exports = { getAllHeis, uploadSubmission, getSubmissions };
