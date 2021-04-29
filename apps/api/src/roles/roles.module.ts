import { Module } from '@nestjs/common';

import { RolesController } from './roles.controller';
import { SharedModule } from '../shared/shared.module';
import {
    CreateRoleHandler,
    DeleteRoleHandler,
    UpdateRoleHandler,
} from './commands';
import { GetRoleHandler, GetRolesHandler } from './queries';

@Module({
    imports: [SharedModule],
    controllers: [RolesController],
    providers: [
        CreateRoleHandler,
        DeleteRoleHandler,
        UpdateRoleHandler,
        GetRoleHandler,
        GetRolesHandler,
    ],
})
export class RolesModule {}
