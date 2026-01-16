const { google } = require('googleapis');

const getAuth = () => {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!clientEmail || !privateKey) {
    throw new Error('Google service account credentials are not configured');
  }
  return new google.auth.JWT(
    clientEmail,
    undefined,
    privateKey,
    ['https://www.googleapis.com/auth/drive.file']
  );
};

const getDriveClient = () => {
  const auth = getAuth();
  return google.drive({ version: 'v3', auth });
};

const uploadBase64File = async ({ fileName, mimeType, dataBase64, folderId }) => {
  const drive = getDriveClient();
  const fileMetadata = {
    name: fileName,
    parents: folderId ? [folderId] : undefined
  };
  const media = {
    mimeType,
    body: Buffer.from(dataBase64, 'base64')
  };
  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id, webViewLink, webContentLink'
  });
  return response.data;
};

module.exports = {
  uploadBase64File
};

