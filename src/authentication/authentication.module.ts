import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { DatabaseModule } from '../database';
import { Config } from '../config';

@Module({
    imports: [
        DatabaseModule,
        JwtModule.register({
            secret: Config.jwt.secret,
        }),
    ],
    controllers: [AuthenticationController],
    providers: [AuthenticationService],
})
export class AuthenticationModule {}
