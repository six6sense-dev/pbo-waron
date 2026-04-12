import { google } from 'googleapis';

const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';

let sheetsClient;
let driveClient;

function getServiceAccountConfig() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKeyRaw) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL atau GOOGLE_PRIVATE_KEY belum diatur.');
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
  return { clientEmail, privateKey };
}

function createAuth(scopes) {
  const { clientEmail, privateKey } = getServiceAccountConfig();
  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes,
  });
}

export function getSpreadsheetId() {
  return process.env.GOOGLE_SPREADSHEET_ID || '1rtb8gYm-6CzgqSiTdWbgwl6tKoJf_NqpV9mqciXsI8U';
}

export function getDriveFolderId() {
  return process.env.GOOGLE_DRIVE_FOLDER_ID || '';
}

export function getSheetsClient() {
  if (!sheetsClient) {
    const auth = createAuth([SHEETS_SCOPE]);
    sheetsClient = google.sheets({ version: 'v4', auth });
  }
  return sheetsClient;
}

export function getDriveClient() {
  if (!driveClient) {
    const auth = createAuth([DRIVE_SCOPE]);
    driveClient = google.drive({ version: 'v3', auth });
  }
  return driveClient;
}
