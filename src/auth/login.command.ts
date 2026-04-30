import { Command, CommandRunner } from 'nest-commander';
import * as crypto from 'crypto';
import * as http from 'http';
import * as os from 'os';
import { exec } from 'child_process';
import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';
import { saveCredentials } from '../common/credentials';
import { BASE_URL } from '../common/api';

const CALLBACK_PORT = 9004;
const LOGIN_TIMEOUT_MS = 5 * 60 * 1000;

function openBrowser(url: string): void {
  const platform = os.platform();
  const cmd =
    platform === 'win32'
      ? `start "" "${url}"`
      : platform === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`;
  exec(cmd);
}

@Command({ name: 'login', description: 'Authenticate with GitHub' })
export class LoginCommand extends CommandRunner {
  async run(): Promise<void> {
    const state = crypto.randomBytes(16).toString('hex');
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

    const clientId = process.env.GITHUB_OAUTH_CLIENTID!;

    const redirectUri = `${BASE_URL}/api/auth/github/callback?is_cli=true`;
    const authUrl =
      `https://github.com/login/oauth/authorize?` +
      new URLSearchParams({
        client_id: clientId,
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        redirect_uri: redirectUri,
      }).toString();

    console.log(chalk.blue('\nOpening GitHub in your browser...'));
    console.log(chalk.grey(`If nothing opens, visit:\n${authUrl}\n`));

    const codePromise = new Promise<string>((resolve, reject) => {
      const server = http.createServer((req, res) => {
        const url = new URL(req.url!, `http://localhost:${CALLBACK_PORT}`);
        const code = url.searchParams.get('code');
        const incomingState = url.searchParams.get('state');

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h2>Login successful! You may close this tab.</h2>');
        server.close();

        if (incomingState && incomingState !== state) {
          reject(new Error('State mismatch — possible CSRF. Login aborted.'));
          return;
        }
        if (!code) {
          reject(new Error('No authorization code received'));
          return;
        }
        resolve(code);
      });

      server.listen(CALLBACK_PORT, 'localhost');
      server.on('error', reject);

      setTimeout(() => {
        server.close();
        reject(new Error('Login timed out after 5 minutes'));
      }, LOGIN_TIMEOUT_MS);
    });

    openBrowser(authUrl);

    let code: string;
    try {
      code = await codePromise;
    } catch (err) {
      console.error(chalk.red(`\nLogin failed: ${(err as Error).message}`));
      process.exit(1);
    }

    const spinner = ora('Exchanging code for tokens...').start();
    try {
      const { data } = await axios.get(`${BASE_URL}/api/auth/github/exchange`, {
        params: { code, code_verifier: codeVerifier, state, is_cli: true, code_challenge: codeChallenge },
        headers: { 'X-API-Version': '1' },
      });
      saveCredentials({ access_token: data.access_token, refresh_token: data.refresh_token });
      spinner.succeed(chalk.green('Logged in successfully!'));
      process.exit(0);
    } catch (err: any) {
      spinner.fail('Authentication failed');
      const msg = err.response?.data?.message ?? err.message;
      console.error(chalk.red(msg));
      process.exit(1);
    }
  }
}
