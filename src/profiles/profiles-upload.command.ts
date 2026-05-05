import { SubCommand, CommandRunner } from 'nest-commander';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { loadCredentials } from '../common/credentials';
import { getApi } from '../common/api';
import { renderDetail } from '../common/table';

@SubCommand({ name: 'upload', arguments: '<file>', description: 'Bulk upload profiles from a CSV file (Admin only)' })
export class ProfilesUploadCommand extends CommandRunner {
  async run([file]: string[]): Promise<void> {
    if (!loadCredentials()) {
      console.log(chalk.yellow('Not logged in. Run `insighta login` first.'));
      return;
    }

    const filepath = path.resolve(file);
    if (!fs.existsSync(filepath)) {
      console.error(chalk.red(`File not found: ${filepath}`));
      process.exit(1);
    }

    const fileBuffer = fs.readFileSync(filepath);
    const blob = new Blob([fileBuffer], { type: 'text/csv' });
    const form = new FormData();
    form.append('file', blob, path.basename(filepath));

    const spinner = ora('Uploading CSV...').start();
    try {
      const { data } = await getApi().post('/api/profiles/upload', form);
      spinner.succeed(chalk.green('Upload complete'));

      renderDetail({
        'Total rows': data.total_rows,
        'Inserted': data.inserted,
        'Skipped': data.skipped,
      });

      if (data.reasons && Object.keys(data.reasons).length > 0) {
        console.log(chalk.grey('\nSkip reasons:'));
        for (const [reason, count] of Object.entries(data.reasons)) {
          console.log(`  ${chalk.cyan(reason)}: ${count}`);
        }
      }
    } catch (err: any) {
      spinner.fail('Upload failed');
      console.error(chalk.red(err.response?.data?.message ?? err.message));
      process.exit(1);
    }
  }
}