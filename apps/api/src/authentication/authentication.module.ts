import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthenticationController } from './authentication.controller';
import { Config } from '../config';
import { SharedModule } from '../shared/shared.module';
import { SessionSerializer } from './middleware/session-serializer.middleware';
import { LoginHandler } from './commands';
import { GetAuthenticatedUserHandler } from './queries';

@Module({
    imports: [
        SharedModule,
        JwtModule.register({
            secret: Config.jwt.secret,
        }),
    ],
    controllers: [AuthenticationController],
    providers: [LoginHandler, GetAuthenticatedUserHandler, SessionSerializer],
})
export class AuthenticationModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(SessionSerializer).forRoutes('*');
    }
}
