import { SubCommand, CommandRunner, Option } from 'nest-commander';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { loadCredentials } from '../common/credentials';
import { getApi } from '../common/api';

interface ExportOptions {
  format: string;
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

@SubCommand({ name: 'export', description: 'Export profiles as CSV' })
export class ProfilesExportCommand extends CommandRunner {
  async run(_params: string[], options?: ExportOptions): Promise<void> {
    if (!options?.format || options.format !== 'csv') {
      console.error(chalk.red('Only CSV export is supported. Use: --format csv'));
      process.exit(1);
    }
    if (!loadCredentials()) {
      console.log(chalk.yellow('Not logged in. Run `insighta login` first.'));
      return;
    }

    const params: Record<string, string | number> = { format: 'csv' };
    if (options.gender) params.gender = options.gender;
    if (options.country) params.country_id = options.country;
    if (options.ageGroup) params.age_group = options.ageGroup;
    if (options.minAge != null) params.min_age = options.minAge;
    if (options.maxAge != null) params.max_age = options.maxAge;
    if (options.sortBy) params.sort_by = options.sortBy;
    if (options.order) params.order = options.order;
    if (options.page != null) params.page = options.page;
    if (options.limit != null) params.limit = options.limit;

    const spinner = ora('Exporting profiles...').start();
    try {
      const { data } = await getApi().get('/api/profiles/export', {
        params,
        responseType: 'text',
      });

      const filename = `profiles_${Date.now()}.csv`;
      const filepath = path.join(process.cwd(), filename);
      fs.writeFileSync(filepath, data as string);
      spinner.succeed(chalk.green(`Exported to ${filepath}`));
    } catch (err: any) {
      spinner.fail('Export failed');
      console.error(chalk.red(err.response?.data?.message ?? err.message));
      process.exit(1);
    }
  }

  @Option({ flags: '--format <format>', description: 'Export format (csv)', required: true })
  parseFormat(val: string) { return val; }

  @Option({ flags: '--gender <gender>', description: 'Filter by gender' })
  parseGender(val: string) { return val; }

  @Option({ flags: '--country <code>', description: 'Filter by country ISO code' })
  parseCountry(val: string) { return val.toUpperCase(); }

  @Option({ flags: '--age-group <group>', description: 'Filter by age group' })
  parseAgeGroup(val: string) { return val; }

  @Option({ flags: '--min-age <n>', description: 'Minimum age' })
  parseMinAge(val: string) { return parseInt(val, 10); }

  @Option({ flags: '--max-age <n>', description: 'Maximum age' })
  parseMaxAge(val: string) { return parseInt(val, 10); }

  @Option({ flags: '--sort-by <field>', description: 'Sort by field' })
  parseSortBy(val: string) { return val; }

  @Option({ flags: '--order <dir>', description: 'Sort direction' })
  parseOrder(val: string) { return val; }

  @Option({ flags: '--page <n>', description: 'Page number' })
  parsePage(val: string) { return parseInt(val, 10); }

  @Option({ flags: '--limit <n>', description: 'Results per page' })
  parseLimit(val: string) { return parseInt(val, 10); }
}
