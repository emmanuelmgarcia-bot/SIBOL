const supabase = require('../config/supabase');
const { uploadBase64File, exportFileAsPdf } = require('../config/googleDrive');
const ExcelJS = require('exceljs');
const path = require('path');

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

    let finalFileName = fileName;
    let finalMimeType = mimeType;
    let finalBase64 = fileBase64;

    if (formType === 'form1' || formType === 'form2') {
      let jsonString;
      try {
        jsonString = Buffer.from(fileBase64, 'base64').toString('utf8');
      } catch (decodeErr) {
        console.error('Decode form JSON error:', decodeErr.message);
        return res.status(400).json({ error: 'Invalid form data' });
      }

      let payload;
      try {
        payload = JSON.parse(jsonString);
      } catch (parseErr) {
        console.error('Parse form JSON error:', parseErr.message);
        return res.status(400).json({ error: 'Invalid form JSON payload' });
      }

      const workbook = new ExcelJS.Workbook();
      const templatePath = path.join(
        __dirname,
        '..',
        'data',
        formType === 'form1' ? 'Form 1.xlsx' : 'Form 2.xlsx'
      );

      try {
        await workbook.xlsx.readFile(templatePath);
      } catch (templateErr) {
        console.error('Load Excel template error:', templateErr.message);
        return res.status(500).json({ error: 'Failed to load Excel template' });
      }

      const sheet = workbook.worksheets[0];

      if (!sheet) {
        return res.status(500).json({ error: 'Excel template is missing worksheet' });
      }

      if (formType === 'form1') {
        const integrated = Array.isArray(payload.integrated) ? payload.integrated : [];
        const elective = Array.isArray(payload.elective) ? payload.elective : [];

        const startRowIntegrated = 12;
        integrated.forEach((row, index) => {
          const excelRow = sheet.getRow(startRowIntegrated + index);
          excelRow.getCell('B').value = row.subject || '';
          excelRow.getCell('C').value = row.units || '';
          excelRow.getCell('D').value = row.program || '';
          excelRow.getCell('F').value = row.faculty || '';
          excelRow.getCell('H').value = row.status || '';
          if (row.education === 'Bachelors') {
            excelRow.getCell('J').value = '✔';
          } else if (row.education === 'Masters') {
            excelRow.getCell('K').value = '✔';
          } else if (row.education === 'Doctoral') {
            excelRow.getCell('L').value = '✔';
          }
          excelRow.commit();
        });

        const startRowElective = 23;
        elective.forEach((row, index) => {
          const excelRow = sheet.getRow(startRowElective + index);
          excelRow.getCell('B').value = row.subject || '';
          excelRow.getCell('C').value = row.units || '';
          excelRow.getCell('D').value = row.program || '';
          excelRow.getCell('F').value = row.faculty || '';
          excelRow.getCell('H').value = row.status || '';
          if (row.education === 'Bachelors') {
            excelRow.getCell('J').value = '✔';
          } else if (row.education === 'Masters') {
            excelRow.getCell('K').value = '✔';
          } else if (row.education === 'Doctoral') {
            excelRow.getCell('L').value = '✔';
          }
          excelRow.commit();
        });
      } else if (formType === 'form2') {
        const integrated = Array.isArray(payload.integrated) ? payload.integrated : [];
        const elective = Array.isArray(payload.elective) ? payload.elective : [];
        const programs = Array.isArray(payload.programs) ? payload.programs : [];

        const startRowIntegrated = 12;
        integrated.forEach((row, index) => {
          const excelRow = sheet.getRow(startRowIntegrated + index);
          excelRow.getCell('B').value = row.subject || '';
          excelRow.getCell('C').value = row.units || '';
          excelRow.getCell('D').value = row.program || '';
          excelRow.getCell('F').value = row.faculty || '';
          excelRow.getCell('H').value = row.status || '';
          if (row.education === 'Bachelors') {
            excelRow.getCell('J').value = '✔';
          } else if (row.education === 'Masters') {
            excelRow.getCell('K').value = '✔';
          } else if (row.education === 'Doctoral') {
            excelRow.getCell('L').value = '✔';
          }
          excelRow.commit();
        });

        const startRowElective = 23;
        elective.forEach((row, index) => {
          const excelRow = sheet.getRow(startRowElective + index);
          excelRow.getCell('B').value = row.subject || '';
          excelRow.getCell('C').value = row.units || '';
          excelRow.getCell('D').value = row.program || '';
          excelRow.getCell('F').value = row.faculty || '';
          excelRow.getCell('H').value = row.status || '';
          if (row.education === 'Bachelors') {
            excelRow.getCell('J').value = '✔';
          } else if (row.education === 'Masters') {
            excelRow.getCell('K').value = '✔';
          } else if (row.education === 'Doctoral') {
            excelRow.getCell('L').value = '✔';
          }
          excelRow.commit();
        });

        const startRowPrograms = 34;
        programs.forEach((row, index) => {
          const excelRow = sheet.getRow(startRowPrograms + index);
          excelRow.getCell('B').value = row.subject || '';
          excelRow.getCell('C').value = row.govtAuthority || row.govt_authority || '';
          excelRow.getCell('D').value = row.ayStarted || row.ay_started || '';
          excelRow.getCell('E').value = row.studentsAy1 || row.students_ay1 || '';
          excelRow.getCell('F').value = row.studentsAy2 || row.students_ay2 || '';
          excelRow.getCell('G').value = row.studentsAy3 || row.students_ay3 || '';
          excelRow.getCell('H').value = row.faculty || '';
          excelRow.getCell('I').value = row.status || '';
          if (row.education === 'Bachelors') {
            excelRow.getCell('J').value = '✔';
          } else if (row.education === 'Masters') {
            excelRow.getCell('K').value = '✔';
          } else if (row.education === 'Doctoral') {
            excelRow.getCell('L').value = '✔';
          }
          excelRow.commit();
        });
      }

      let buffer;
      try {
        buffer = await workbook.xlsx.writeBuffer();
      } catch (writeErr) {
        console.error('Excel write buffer error:', writeErr.message);
        return res.status(500).json({ error: 'Failed to generate Excel file' });
      }

      finalBase64 = buffer.toString('base64');
      finalMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const today = new Date().toISOString().slice(0, 10);
      finalFileName = formType === 'form1'
        ? `Form 1 - ${today}.xlsx`
        : `Form 2 - ${today}.xlsx`;
    }

    const fileData = await uploadBase64File({
      fileName: finalFileName,
      mimeType: finalMimeType,
      dataBase64: finalBase64,
      folderId,
      driveMimeType:
        formType === 'form1' || formType === 'form2'
          ? 'application/vnd.google-apps.spreadsheet'
          : undefined
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
            file_name: finalFileName
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
      .select('id, hei_id, campus, form_type, file_name, file_id, created_at')
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

const downloadSubmissionPdf = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Submission id is required' });
    }

    const { data, error } = await supabase
      .from('submissions')
      .select('id, file_id, file_name')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase submissions fetch error:', error.message);
      return res.status(500).json({ error: 'Failed to load submission: ' + error.message });
    }

    if (!data || !data.file_id) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    let pdfBuffer;
    try {
      pdfBuffer = await exportFileAsPdf(data.file_id);
    } catch (driveErr) {
      console.error('Drive export PDF error:', driveErr.message);
      return res.status(500).json({ error: 'Failed to export file as PDF' });
    }

    const baseName = data.file_name && data.file_name.lastIndexOf('.') > 0
      ? data.file_name.substring(0, data.file_name.lastIndexOf('.'))
      : (data.file_name || 'submission');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${baseName}.pdf"`);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error('Download submission PDF exception:', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

const getMasterPrograms = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('program_master')
      .select('id, code, title')
      .order('code', { ascending: true });

    if (error) {
      console.error('Supabase program_master query error:', error.message);
      return res.status(500).json({ error: 'Failed to load master programs: ' + error.message });
    }

    return res.status(200).json(data || []);
  } catch (err) {
    console.error('Get master programs exception:', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

const createMasterProgram = async (req, res) => {
  try {
    const { code, title } = req.body;

    if (!code || !title) {
      return res.status(400).json({ error: 'Program code and title are required' });
    }

    const trimmedCode = String(code).trim();
    const trimmedTitle = String(title).trim();

    const { data, error } = await supabase
      .from('program_master')
      .insert([
        {
          code: trimmedCode,
          title: trimmedTitle
        }
      ])
      .select('id, code, title')
      .single();

    if (error) {
      console.error('Supabase create master program error:', error.message);
      return res.status(500).json({ error: 'Failed to create program: ' + error.message });
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error('Create master program exception:', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

const deleteMasterProgram = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Program id is required' });
    }

    const { error } = await supabase
      .from('program_master')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete master program error:', error.message);
      return res.status(500).json({ error: 'Failed to delete program: ' + error.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Delete master program exception:', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

const createProgramRequest = async (req, res) => {
  try {
    const {
      heiId,
      campus,
      programCode,
      programTitle,
      fileName,
      mimeType,
      fileBase64
    } = req.body;

    if (!heiId || !campus || !programCode || !programTitle || !fileName || !mimeType || !fileBase64) {
      return res.status(400).json({ error: 'Missing required fields for program request' });
    }

    const normalizedMime = String(mimeType).toLowerCase();
    const isPdf =
      normalizedMime.includes('pdf') ||
      (fileName && String(fileName).toLowerCase().endsWith('.pdf'));

    if (!isPdf) {
      return res.status(400).json({ error: 'Only PDF curriculum files are allowed' });
    }

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || undefined;

    let fileData;
    try {
      fileData = await uploadBase64File({
        fileName,
        mimeType,
        dataBase64: fileBase64,
        folderId
      });
    } catch (uploadErr) {
      console.error('Program request upload error:', uploadErr.message);
      if (uploadErr.message && uploadErr.message.includes('Google service account credentials')) {
        return res.status(500).json({ error: 'Google Drive credentials are not configured on the server' });
      }
      return res.status(500).json({ error: 'Failed to upload curriculum file' });
    }

    const { data, error } = await supabase
      .from('program_requests')
      .insert([
        {
          hei_id: heiId,
          campus,
          program_code: programCode,
          program_title: programTitle,
          file_id: fileData.id,
          file_name: fileName,
          web_view_link: fileData.webViewLink || null,
          web_content_link: fileData.webContentLink || null,
          status: 'For Approval'
        }
      ])
      .select('id, hei_id, campus, program_code, program_title, status, file_name, web_view_link, web_content_link, created_at')
      .single();

    if (error) {
      console.error('Supabase create program request error:', error.message);
      return res.status(500).json({ error: 'Failed to save program request: ' + error.message });
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error('Create program request exception:', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

const listProgramRequests = async (req, res) => {
  try {
    const { region, heiId, campus, status } = req.query;

    if (!region && !heiId) {
      return res.status(400).json({ error: 'Region or heiId is required' });
    }

    let heiIds = [];

    if (region) {
      let heiQuery = supabase
        .from('heis')
        .select('id, region')
        .eq('region', region);

      if (heiId) {
        heiQuery = heiQuery.eq('id', heiId);
      }

      const { data: heisData, error: heisError } = await heiQuery;

      if (heisError) {
        console.error('Supabase heis for program requests error:', heisError.message);
        return res.status(500).json({ error: 'Failed to load HEIs for program requests: ' + heisError.message });
      }

      heiIds = (heisData || []).map(h => h.id);

      if (heiIds.length === 0) {
        return res.status(200).json([]);
      }
    } else if (heiId) {
      heiIds = [heiId];
    }

    let query = supabase
      .from('program_requests')
      .select('id, hei_id, campus, program_code, program_title, status, file_name, web_view_link, web_content_link, created_at');

    if (heiIds.length > 0) {
      query = query.in('hei_id', heiIds);
    }

    if (campus) {
      query = query.eq('campus', campus);
    }

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Supabase list program requests error:', error.message);
      return res.status(500).json({ error: 'Failed to load program requests: ' + error.message });
    }

    return res.status(200).json(data || []);
  } catch (err) {
    console.error('List program requests exception:', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

const updateProgramRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, region } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: 'Request id and status are required' });
    }

    if (!['Approved', 'For Approval', 'Declined'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const { data: requestRow, error: requestError } = await supabase
      .from('program_requests')
      .select('id, hei_id')
      .eq('id', id)
      .single();

    if (requestError) {
      console.error('Supabase fetch program request error:', requestError.message);
      return res.status(500).json({ error: 'Failed to load program request: ' + requestError.message });
    }

    if (!requestRow) {
      return res.status(404).json({ error: 'Program request not found' });
    }

    if (region) {
      const { data: heiRow, error: heiError } = await supabase
        .from('heis')
        .select('id, region')
        .eq('id', requestRow.hei_id)
        .single();

      if (heiError) {
        console.error('Supabase fetch hei for program request error:', heiError.message);
        return res.status(500).json({ error: 'Failed to load HEI for program request: ' + heiError.message });
      }

      if (!heiRow) {
        return res.status(404).json({ error: 'HEI not found for program request' });
      }

      if (heiRow.region !== region) {
        return res.status(403).json({ error: 'Not allowed to modify program request from another region' });
      }
    }

    const { error: updateError } = await supabase
      .from('program_requests')
      .update({ status })
      .eq('id', id);

    if (updateError) {
      console.error('Supabase update program request status error:', updateError.message);
      return res.status(500).json({ error: 'Failed to update program request status: ' + updateError.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Update program request status exception:', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

const getFaculty = async (req, res) => {
  try {
    const { heiId, campus } = req.query;

    if (!heiId) {
      return res.status(400).json({ error: 'heiId is required' });
    }

    let query = supabase
      .from('faculty')
      .select('*')
      .eq('hei_id', heiId)
      .order('name', { ascending: true });

    if (campus) {
      query = query.eq('campus', campus);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase get faculty error:', error.message);
      return res.status(500).json({ error: 'Failed to load faculty: ' + error.message });
    }

    return res.status(200).json(data || []);
  } catch (err) {
    console.error('Get faculty exception:', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

const createFaculty = async (req, res) => {
  try {
    const { heiId, campus, name, status, education } = req.body;

    if (!heiId || !campus || !name || !status || !education) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const { data, error } = await supabase
      .from('faculty')
      .insert([
        {
          hei_id: heiId,
          campus,
          name,
          status,
          education
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase create faculty error:', error.message);
      return res.status(500).json({ error: 'Failed to add faculty: ' + error.message });
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error('Create faculty exception:', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, education } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Faculty ID is required' });
    }

    const { data, error } = await supabase
      .from('faculty')
      .update({ name, status, education })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update faculty error:', error.message);
      return res.status(500).json({ error: 'Failed to update faculty: ' + error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Update faculty exception:', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Faculty ID is required' });
    }

    const { error } = await supabase
      .from('faculty')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete faculty error:', error.message);
      return res.status(500).json({ error: 'Failed to delete faculty: ' + error.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Delete faculty exception:', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

const createSubject = async (req, res) => {
  try {
    const {
      heiId,
      campus,
      type,
      code,
      title,
      units,
      govtAuthority,
      ayStarted,
      studentsAy1,
      studentsAy2,
      studentsAy3,
      fileName,
      mimeType,
      fileBase64
    } = req.body;

    if (!heiId || !campus || !type || !code || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let fileData = { id: null, webViewLink: null, webContentLink: null };
    
    if (fileName && mimeType && fileBase64) {
        const normalizedMime = String(mimeType).toLowerCase();
        const isPdf =
          normalizedMime.includes('pdf') ||
          String(fileName).toLowerCase().endsWith('.pdf');

        if (!isPdf) {
          return res.status(400).json({ error: 'Only PDF syllabus files are allowed' });
        }

        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || undefined;
        try {
            fileData = await uploadBase64File({
                fileName,
                mimeType,
                dataBase64: fileBase64,
                folderId
            });
        } catch (uploadErr) {
            console.error('Subject syllabus upload error:', uploadErr.message);
            return res.status(500).json({ error: 'Failed to upload syllabus file: ' + uploadErr.message });
        }
    }

    const { data, error } = await supabase
      .from('subjects')
      .insert([
        {
          hei_id: heiId,
          campus,
          type,
          code,
          title,
          units: units || null,
          govt_authority: govtAuthority || null,
          ay_started: ayStarted || null,
          students_ay1: studentsAy1 || null,
          students_ay2: studentsAy2 || null,
          students_ay3: studentsAy3 || null,
          syllabus_file_id: fileData.id,
          syllabus_file_name: fileName || null,
          syllabus_view_link: fileData.webViewLink || null,
          status: 'For Approval'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase create subject error:', error.message);
      return res.status(500).json({ error: 'Failed to save subject: ' + error.message });
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error('Create subject exception:', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

const getSubjects = async (req, res) => {
  try {
    const { heiId, campus, region, status } = req.query;

    let heiIds = [];

    // If region is provided (Admin view), find HEIs in that region
    if (region) {
        const { data: heisData, error: heisError } = await supabase
            .from('heis')
            .select('id')
            .eq('region', region);
        
        if (heisError) throw heisError;
        heiIds = heisData.map(h => h.id);
        
        // If specific HEI selected within region
        if (heiId) {
            if (!heiIds.includes(parseInt(heiId)) && !heiIds.includes(heiId)) {
                return res.status(200).json([]); // HEI not in region
            }
            heiIds = [heiId];
        }
    } else if (heiId) {
        heiIds = [heiId];
    } else {
        return res.status(400).json({ error: 'Region or HEI ID required' });
    }

    if (heiIds.length === 0) return res.status(200).json([]);

    let query = supabase
      .from('subjects')
      .select('*')
      .in('hei_id', heiIds)
      .order('created_at', { ascending: false });

    if (campus) {
      query = query.eq('campus', campus);
    }
    
    if (status && status !== 'All') {
        query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase get subjects error:', error.message);
      return res.status(500).json({ error: 'Failed to load subjects: ' + error.message });
    }

    return res.status(200).json(data || []);
  } catch (err) {
    console.error('Get subjects exception:', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

const updateSubjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: 'ID and status are required' });
    }

    const { data, error } = await supabase
      .from('subjects')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update subject status error:', error.message);
      return res.status(500).json({ error: 'Failed to update status: ' + error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Update subject status exception:', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete subject error:', error.message);
      return res.status(500).json({ error: 'Failed to delete subject: ' + error.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Delete subject exception:', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

module.exports = {
  getAllHeis,
  uploadSubmission,
  getSubmissions,
  getMasterPrograms,
  createMasterProgram,
  deleteMasterProgram,
  createProgramRequest,
  listProgramRequests,
  updateProgramRequestStatus,
  getFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  createSubject,
  getSubjects,
  updateSubjectStatus,
  deleteSubject,
  downloadSubmissionPdf
};
