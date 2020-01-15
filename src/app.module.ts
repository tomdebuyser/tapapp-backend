import { Module } from '@nestjs/common';

import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { MailerModule } from './mailer/mailer.module';
import { AuthenticationModule } from './authentication/authentication.module';

@Module({
    imports: [AuthenticationModule, MailerModule, RolesModule, UsersModule],
})
export class AppModule {}
