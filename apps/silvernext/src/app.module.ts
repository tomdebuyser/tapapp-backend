import { Module } from '@nestjs/common';

import { LoggerModule } from '@libs/logger';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuthenticationModule } from './authentication/authentication.module';

@Module({
    imports: [AuthenticationModule, RolesModule, UsersModule, LoggerModule],
})
export class AppModule {}
