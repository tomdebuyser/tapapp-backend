import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { MailerModule } from '@libs/mailer';
import { AuthenticationController } from './authentication.controller';
import { Config } from '../config';
import { UsersModule } from '../users/users.module';
import { SharedModule } from '../shared/shared.module';
import { SessionSerializer } from './session-serializer.middleware';
import { AuthenticationQueries } from './queries/authentication.queries';
import {
    ChangePasswordHandler,
    LoginHandler,
    RequestPasswordResetHandler,
    ResetPasswordHandler,
} from './commands';

@Module({
    imports: [
        SharedModule,
        JwtModule.register({
            secret: Config.jwt.secret,
        }),
        MailerModule.register(Config.mailing),
        UsersModule,
    ],
    controllers: [AuthenticationController],
    providers: [
        ChangePasswordHandler,
        LoginHandler,
        RequestPasswordResetHandler,
        ResetPasswordHandler,
        AuthenticationQueries,
        SessionSerializer,
    ],
})
export class AuthenticationModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(SessionSerializer).forRoutes('*');
    }
}
