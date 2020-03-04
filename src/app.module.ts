import { Module } from '@nestjs/common';

import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { LoggerModule } from './logger/logger.module';

@Module({
    imports: [AuthenticationModule, RolesModule, UsersModule, LoggerModule],
})
export class AppModule {}
