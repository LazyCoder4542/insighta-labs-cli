import { SubCommand, CommandRunner, Option } from 'nest-commander';
import chalk from 'chalk';
import ora from 'ora';
import { loadCredentials } from '../common/credentials';
import { getApi } from '../common/api';
import { renderTable } from '../common/table';

interface ListOptions {
  gender?: string;
  country?: string;
  ageGroup?: string;
  minAge?: number;
  maxAge?: number;
  sortBy?: string;
  order?: string;
  page?: number;
  limit?: number;
}

@SubCommand({ name: 'list', description: 'List profiles with optional filters' })
export class ProfilesListCommand extends CommandRunner {
  async run(_params: string[], options?: ListOptions): Promise<void> {
    if (!loadCredentials()) {
      console.log(chalk.yellow('Not logged in. Run `insighta login` first.'));
      return;
    }

    const params: Record<string, string | number> = {};
    if (options?.gender) params.gender = options.gender;
    if (options?.country) params.country_id = options.country;
    if (options?.ageGroup) params.age_group = options.ageGroup;
    if (options?.minAge != null) params.min_age = options.minAge;
    if (options?.maxAge != null) params.max_age = options.maxAge;
    if (options?.sortBy) params.sort_by = options.sortBy;
    if (options?.order) params.order = options.order;
    if (options?.page != null) params.page = options.page;
    if (options?.limit != null) params.limit = options.limit;

    const spinner = ora('Fetching profiles...').start();
    try {
      const { data } = await getApi().get('/api/profiles', { params });
      spinner.stop();

      const profiles: any[] = data.data ?? [];
      if (!profiles.length) {
        console.log(chalk.yellow('No profiles found.'));
        return;
      }

      renderTable(
        ['ID', 'Name', 'Gender', 'Age', 'Age Group', 'Country', 'Created'],
        profiles.map((p) => [
          p.id?.slice(0, 8) + '…',
          p.name,
          p.gender,
          p.age,
          p.age_group,
          `${p.country_name} (${p.country_id})`,
          new Date(p.created_at).toLocaleDateString(),
        ]),
      );
      console.log(
        chalk.grey(
          `  Page ${data.page}/${data.total_pages} — ${profiles.length} of ${data.total} profile(s)`,
        ),
      );
    } catch (err: any) {
      spinner.fail('Failed to fetch profiles');
      console.error(chalk.red(err.response?.data?.message ?? err.message));
      process.exit(1);
    }
  }

  @Option({ flags: '--gender <gender>', description: 'Filter by gender (male|female)' })
  parseGender(val: string) { return val; }

  @Option({ flags: '--country <code>', description: 'Filter by country ISO code (e.g. NG)' })
  parseCountry(val: string) { return val.toUpperCase(); }

  @Option({ flags: '--age-group <group>', description: 'Filter by age group (child|teenager|adult|senior)' })
  parseAgeGroup(val: string) { return val; }

  @Option({ flags: '--min-age <n>', description: 'Minimum age (inclusive)' })
  parseMinAge(val: string) { return parseInt(val, 10); }

  @Option({ flags: '--max-age <n>', description: 'Maximum age (inclusive)' })
  parseMaxAge(val: string) { return parseInt(val, 10); }

  @Option({ flags: '--sort-by <field>', description: 'Sort by: age | created_at | gender_probability' })
  parseSortBy(val: string) { return val; }

  @Option({ flags: '--order <dir>', description: 'Sort direction: asc | desc' })
  parseOrder(val: string) { return val; }

  @Option({ flags: '--page <n>', description: 'Page number (1-indexed)' })
  parsePage(val: string) { return parseInt(val, 10); }

  @Option({ flags: '--limit <n>', description: 'Results per page (max 50)' })
  parseLimit(val: string) { return parseInt(val, 10); }
}
