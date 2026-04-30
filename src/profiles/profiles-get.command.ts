import { SubCommand, CommandRunner } from 'nest-commander';
import chalk from 'chalk';
import ora from 'ora';
import { loadCredentials } from '../common/credentials';
import { getApi } from '../common/api';
import { renderDetail } from '../common/table';

@SubCommand({ name: 'get', description: 'Get a profile by ID', arguments: '<id>' })
export class ProfilesGetCommand extends CommandRunner {
  async run([id]: string[]): Promise<void> {
    if (!id) {
      console.error(chalk.red('Usage: insighta profiles get <id>'));
      process.exit(1);
    }
    if (!loadCredentials()) {
      console.log(chalk.yellow('Not logged in. Run `insighta login` first.'));
      return;
    }

    const spinner = ora(`Fetching profile ${id}...`).start();
    try {
      const { data: p } = await getApi().get(`/api/profiles/${id}`);
      spinner.stop();
      renderDetail({
        ID: p.id,
        Name: p.name,
        Gender: `${p.gender} (${(p.gender_probability * 100).toFixed(1)}%)`,
        Age: p.age,
        'Age Group': p.age_group,
        Country: `${p.country_name} (${p.country_id})`,
        'Country Probability': `${(p.country_probability * 100).toFixed(1)}%`,
        'Created At': new Date(p.created_at).toLocaleString(),
      });
    } catch (err: any) {
      spinner.fail('Profile not found');
      console.error(chalk.red(err.response?.data?.message ?? err.message));
      process.exit(1);
    }
  }
}
