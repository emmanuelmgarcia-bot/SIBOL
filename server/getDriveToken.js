const { google } = require('googleapis');
const readline = require('readline');
require('dotenv').config();

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:3000/oauth2callback';

if (!clientId || !clientSecret) {
  console.error('Missing GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET in .env');
  process.exit(1);
}

const oAuth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectUri
);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/drive.file']
});

console.log('Authorize this app by visiting this URL:\n');
console.log(authUrl + '\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter the code from that page here: ', async (code) => {
  rl.close();
  try {
    const { tokens } = await oAuth2Client.getToken(code.trim());
    console.log('\nAccess token:', tokens.access_token || '(none)');
    console.log('Refresh token:', tokens.refresh_token || '(none)');
    if (!tokens.refresh_token) {
      console.log('\nNo refresh token was returned. Ensure:');
      console.log('- This OAuth client has redirect URI set to ' + redirectUri);
      console.log('- You used access_type=offline and prompt=consent (already in this script).');
      console.log('- You removed any previous access for this app from your Google Account security settings and tried again.');
    }
  } catch (err) {
    console.error('Error retrieving tokens:', err.message);
  }
});
