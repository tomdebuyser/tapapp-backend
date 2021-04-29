import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UsersController } from './users.controller';
import { Config } from '../config';
import { SharedModule } from '../shared/shared.module';
import {
    CreateUserHandler,
    DeactivateUserHandler,
    DeleteUserHandler,
    ResendRegisterMailHandler,
    UpdateUserHandler,
} from './commands';
import { GetUserHandler, GetUsersHandler } from './queries';
import { RegisterMailService } from './services/register-mail.service';

@Module({
    imports: [
        SharedModule,
        JwtModule.register({
            secret: Config.jwt.secret,
        }),
    ],
    controllers: [UsersController],
    providers: [
        CreateUserHandler,
        DeactivateUserHandler,
        DeleteUserHandler,
        ResendRegisterMailHandler,
        UpdateUserHandler,
        GetUserHandler,
        GetUsersHandler,
        RegisterMailService,
    ],
})
export class UsersModule {}
