import dotenv from 'dotenv';
import { google } from 'googleapis';
import readline from 'readline';
dotenv.config({ path: '.env.local' });

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000' // same as your redirect URI
);

// This will prompt you to authorize access
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar'],
});

console.log('Authorize this app by visiting this URL:\n', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('\nPaste the code from the browser here: ', async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  console.log('\n✅ Your refresh token:\n', tokens.refresh_token);
  rl.close();
});
