import { Command, CommandRunner } from 'nest-commander';
import { ProfilesListCommand } from './profiles-list.command';
import { ProfilesGetCommand } from './profiles-get.command';
import { ProfilesSearchCommand } from './profiles-search.command';
import { ProfilesCreateCommand } from './profiles-create.command';
import { ProfilesExportCommand } from './profiles-export.command';

@Command({
  name: 'profiles',
  description: 'Manage profiles',
  subCommands: [
    ProfilesListCommand,
    ProfilesGetCommand,
    ProfilesSearchCommand,
    ProfilesCreateCommand,
    ProfilesExportCommand,
  ],
})
export class ProfilesCommand extends CommandRunner {
  async run(): Promise<void> {
    this.command.outputHelp();
  }
}
