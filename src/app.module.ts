import { Module } from '@nestjs/common';

import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { MailerModule } from './mailer/mailer.module';

@Module({
    imports: [UsersModule, RolesModule, MailerModule],
})
export class AppModule {}
