import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const DIR = path.join(os.homedir(), '.insighta');
const FILE = path.join(DIR, 'credentials.json');

export interface Credentials {
  api_url?: string;
  access_token: string;
  refresh_token: string;
}

export function loadCredentials(): Credentials | null {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8')) as Credentials;
  } catch {
    return null;
  }
}

export function saveCredentials(creds: Credentials): void {
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(creds, null, 2));
}

export function clearCredentials(): void {
  try {
    fs.unlinkSync(FILE);
  } catch {
    // already absent
  }
}
