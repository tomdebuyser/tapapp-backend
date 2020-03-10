import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { MailerModule } from '@libs/mailer';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { PassportLocalStrategy } from './passport-local.strategy';
import { Config } from '../config';
import { UsersModule } from '../users/users.module';
import { AuthenticationQueries } from './authentication.queries';
import { SessionSerializer } from './session.serializer';
import { SharedModule } from '../_shared/shared.module';

@Module({
    imports: [
        SharedModule,
        JwtModule.register({
            secret: Config.jwt.secret,
        }),
        MailerModule.register({ ...Config.mailing, ...Config.logging }),
        UsersModule,
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
