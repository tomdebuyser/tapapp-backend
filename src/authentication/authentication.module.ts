import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { PassportLocalStrategy } from './passport-local.strategy';
import { DatabaseModule } from '../database';
import { Config } from '../config';
import { UsersModule } from '../users/users.module';
import { AuthenticationQueries } from './authentication.queries';
import { SessionSerializer } from './session.serializer';
import { MailerModule } from '../mailer/mailer.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
    imports: [
        DatabaseModule,
        JwtModule.register({
            secret: Config.jwt.secret,
        }),
        UsersModule,
        MailerModule,
        LoggerModule,
    ],
    controllers: [AuthenticationController],
    providers: [
        AuthenticationService,
        AuthenticationQueries,
        PassportLocalStrategy,
        SessionSerializer,
    ],
})
export class AuthenticationModule {}
