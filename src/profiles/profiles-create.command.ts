import { SubCommand, CommandRunner, Option } from 'nest-commander';
import chalk from 'chalk';
import ora from 'ora';
import { loadCredentials } from '../common/credentials';
import { getApi } from '../common/api';
import { renderDetail } from '../common/table';

interface CreateOptions {
  name: string;
}

@SubCommand({ name: 'create', description: 'Create a new profile (Admin only)' })
export class ProfilesCreateCommand extends CommandRunner {
  async run(_params: string[], options?: CreateOptions): Promise<void> {
    if (!options?.name) {
      console.error(chalk.red('Usage: insighta profiles create --name "<name>"'));
      process.exit(1);
    }
    if (!loadCredentials()) {
      console.log(chalk.yellow('Not logged in. Run `insighta login` first.'));
      return;
    }

    const spinner = ora(`Creating profile for "${options.name}"...`).start();
    try {
      const { data: p } = await getApi().post('/api/profiles', { name: options.name });
      spinner.succeed(chalk.green('Done.'));
      renderDetail({
        ID: p.id,
        Name: p.name,
        Gender: `${p.gender} (${(p.gender_probability * 100).toFixed(1)}%)`,
        Age: p.age,
        'Age Group': p.age_group,
        Country: `${p.country_name} (${p.country_id})`,
        'Country Probability': `${(p.country_probability * 100).toFixed(1)}%`,
      });
    } catch (err: any) {
      spinner.fail('Failed to create profile');
      console.error(chalk.red(err.response?.data?.message ?? err.message));
      process.exit(1);
    }
  }

  @Option({ flags: '--name <name>', description: 'Name to create a profile for', required: true })
  parseName(val: string) { return val; }
}
