import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { MailerModule } from '@libs/mailer';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { Config } from '../config';
import { UsersModule } from '../users/users.module';
import { AuthenticationQueries } from './authentication.queries';
import { SharedModule } from '../_shared/shared.module';
import { SessionSerializer } from './session-serializer.middleware';

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
        SessionSerializer,
    ],
})
export class AuthenticationModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(SessionSerializer).forRoutes('*');
    }
}
