import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { MailerModule } from '@libs/mailer';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Config } from '../config';
import { UsersQueries } from './users.queries';
import { SharedModule } from '../shared/shared.module';

@Module({
    imports: [
        SharedModule,
        JwtModule.register({
            secret: Config.jwt.secret,
        }),
        MailerModule.register(Config.mailing),
    ],
    controllers: [UsersController],
    providers: [UsersService, UsersQueries],
})
export class UsersModule {}
