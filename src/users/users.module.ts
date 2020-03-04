import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DatabaseModule } from '../database';
import { Config } from '../config';
import { UsersQueries } from './users.queries';
import { MailerModule } from '../mailer/mailer.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
    imports: [
        DatabaseModule,
        LoggerModule,
        JwtModule.register({
            secret: Config.jwt.secret,
        }),
        MailerModule,
    ],
    controllers: [UsersController],
    providers: [UsersService, UsersQueries],
})
export class UsersModule {}
