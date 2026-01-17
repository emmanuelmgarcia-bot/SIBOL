const { google } = require('googleapis');
const { Readable } = require('stream');

const getAuth = () => {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (clientId && clientSecret && refreshToken) {
    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    return oAuth2Client;
  }

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error('Google Drive credentials are not configured');
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

const getFileStream = async (fileId) => {
  const drive = getDriveClient();
  return await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  );
};

const uploadBase64File = async ({ fileName, mimeType, dataBase64, folderId, driveMimeType }) => {
  const drive = getDriveClient();
  const fileMetadata = {
    name: fileName,
    parents: folderId ? [folderId] : undefined,
    mimeType: driveMimeType || undefined
  };
  const media = {
    mimeType,
    body: Readable.from(Buffer.from(dataBase64, 'base64'))
  };
  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id, webViewLink, webContentLink, mimeType'
  });
  return response.data;
};

const exportFileAsPdf = async (fileId) => {
  const drive = getDriveClient();
  const res = await drive.files.export(
    {
      fileId,
      mimeType: 'application/pdf'
    },
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(res.data);
};

module.exports = {
  uploadBase64File,
  exportFileAsPdf,
  getFileStream
};
