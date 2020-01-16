import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { PassportLocalStrategy } from './passport-local.strategy';
import { DatabaseModule } from '../database';
import { Config } from '../config';
import { UsersModule } from '../users/users.module';
import { AuthenticationQueries } from './authentication.queries';

@Module({
    imports: [
        DatabaseModule,
        JwtModule.register({
            secret: Config.jwt.secret,
        }),
        UsersModule,
    ],
    controllers: [AuthenticationController],
    providers: [
        AuthenticationService,
        AuthenticationQueries,
        PassportLocalStrategy,
    ],
})
export class AuthenticationModule {}
