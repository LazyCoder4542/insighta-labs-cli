import { SubCommand, CommandRunner, Option } from 'nest-commander';
import chalk from 'chalk';
import ora from 'ora';
import { loadCredentials } from '../common/credentials';
import { getApi } from '../common/api';
import { renderTable } from '../common/table';

interface SearchOptions {
  page?: number;
  limit?: number;
}

@SubCommand({ name: 'search', description: 'Natural-language profile search', arguments: '<query...>' })
export class ProfilesSearchCommand extends CommandRunner {
  async run(params: string[], options?: SearchOptions): Promise<void> {
    const query = params.join(' ').trim();
    if (!query) {
      console.error(chalk.red('Usage: insighta profiles search "<query>"'));
      process.exit(1);
    }
    if (!loadCredentials()) {
      console.log(chalk.yellow('Not logged in. Run `insighta login` first.'));
      return;
    }
    console.log(query)

    const reqParams: Record<string, string | number> = { q: query };
    if (options?.page != null) reqParams.page = options.page;
    if (options?.limit != null) reqParams.limit = options.limit;

    const spinner = ora(`Searching for "${query}"...`).start();
    try {
      const { data } = await getApi().get('/api/profiles/search', { params: reqParams });
      spinner.stop();

      const profiles: any[] = data.data ?? [];
      if (!profiles.length) {
        console.log(chalk.yellow('No profiles found.'));
        return;
      }

      renderTable(
        ['ID', 'Name', 'Gender', 'Age', 'Age Group', 'Country'],
        profiles.map((p) => [
          p.id?.slice(0, 8) + '…',
          p.name,
          p.gender,
          p.age,
          p.age_group,
          `${p.country_name} (${p.country_id})`,
        ]),
      );
      console.log(
        chalk.grey(
          `  Page ${data.page}/${data.total_pages} — ${profiles.length} of ${data.total} result(s)`,
        ),
      );
    } catch (err: any) {
      spinner.fail('Search failed');
      console.error(chalk.red(err.response?.data?.message ?? err.message));
      process.exit(1);
    }
  }

  @Option({ flags: '--page <n>', description: 'Page number' })
  parsePage(val: string) { return parseInt(val, 10); }

  @Option({ flags: '--limit <n>', description: 'Results per page (max 50)' })
  parseLimit(val: string) { return parseInt(val, 10); }
}
