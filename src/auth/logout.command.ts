import { Command, CommandRunner } from 'nest-commander';
import chalk from 'chalk';
import ora from 'ora';
import { loadCredentials, clearCredentials } from '../common/credentials';
import { getApi } from '../common/api';

@Command({ name: 'logout', description: 'Log out and revoke tokens' })
export class LogoutCommand extends CommandRunner {
  async run(): Promise<void> {
    if (!loadCredentials()) {
      console.log(chalk.yellow('Not logged in.'));
      return;
    }

    const spinner = ora('Logging out...').start();
    try {
      await getApi().post('/api/auth/logout');
    } catch {
      // best-effort revocation; clear locally regardless
    }
    clearCredentials();
    spinner.succeed(chalk.green('Logged out successfully.'));
  }
}
