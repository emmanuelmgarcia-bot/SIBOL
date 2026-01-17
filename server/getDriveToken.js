const { google } = require('googleapis');
const readline = require('readline');
require('dotenv').config();

const CLIENT_ID = '88262753746-7q3ht0124olt210qqa4gook043g14v63.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET in .env');
  process.exit(1);
}

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
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
      console.log('- This OAuth client has redirect URI set to ' + REDIRECT_URI);
      console.log('- You used access_type=offline and prompt=consent (already in this script).');
      console.log('- You removed any previous access for this app from your Google Account security settings and tried again.');
    }
  } catch (err) {
    console.error('Error retrieving tokens:', err.message);
  }
});