import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DatabaseModule } from '../database';
import { Config } from '../config';

@Module({
    imports: [
        DatabaseModule,
        JwtModule.register({
            secret: Config.jwt.secret,
        }),
    ],
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule {}
