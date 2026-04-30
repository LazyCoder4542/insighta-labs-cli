import { Command, CommandRunner } from 'nest-commander';
import chalk from 'chalk';
import ora from 'ora';
import { loadCredentials } from '../common/credentials';
import { getApi } from '../common/api';

@Command({ name: 'whoami', description: 'Show current authenticated user' })
export class WhoamiCommand extends CommandRunner {
  async run(): Promise<void> {
    if (!loadCredentials()) {
      console.log(chalk.yellow('Not logged in. Run `insighta login` first.'));
      return;
    }

    const spinner = ora('Fetching user info...').start();
    try {
      const { data } = await getApi().get('/api/users/me');
      spinner.stop();
      console.log(chalk.cyan('\nLogged in as:'));
      console.log(`  Name:     ${data.name ?? data.username ?? data.login ?? 'N/A'}`);
      console.log(`  Email:    ${data.email ?? 'N/A'}`);
      if (data.role) console.log(`  Role:     ${data.role}`);
      if (data.github_username) console.log(`  GitHub:   ${data.github_username}`);
      console.log('');
    } catch (err: any) {
      spinner.fail('Failed to fetch user info');
      const msg = err.response?.data?.message ?? err.message;
      console.error(chalk.red(msg));
      process.exit(1);
    }
  }
}
