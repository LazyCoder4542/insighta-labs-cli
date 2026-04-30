import { Module } from '@nestjs/common';
import { LoginCommand } from './auth/login.command';
import { LogoutCommand } from './auth/logout.command';
import { WhoamiCommand } from './auth/whoami.command';
import { ProfilesCommand } from './profiles/profiles.command';
import { ProfilesListCommand } from './profiles/profiles-list.command';
import { ProfilesGetCommand } from './profiles/profiles-get.command';
import { ProfilesSearchCommand } from './profiles/profiles-search.command';
import { ProfilesCreateCommand } from './profiles/profiles-create.command';
import { ProfilesExportCommand } from './profiles/profiles-export.command';

@Module({
  providers: [
    LoginCommand,
    LogoutCommand,
    WhoamiCommand,
    ProfilesCommand,
    ProfilesListCommand,
    ProfilesGetCommand,
    ProfilesSearchCommand,
    ProfilesCreateCommand,
    ProfilesExportCommand,
  ],
})
export class AppModule {}
