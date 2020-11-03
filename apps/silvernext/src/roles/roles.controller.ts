import {
    Controller,
    Post,
    Body,
    Get,
    Query,
    UseGuards,
    Put,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import {
    CreateRoleRequest,
    GetRolesResponse,
    GetRolesRequestQuery,
    RoleResponse,
    RoleIdParam,
    UpdateRoleRequest,
} from './dto';
import { AuthenticatedGuard, RequiredPermissionsGuard } from '../shared/guards';
import { GetUserSession, RequiredPermissions } from '../shared/decorators';
import { UserSession } from '../shared/constants';
import {
    CreateRoleHandler,
    DeleteRoleHandler,
    UpdateRoleHandler,
} from './commands';
import { GetRoleHandler, GetRolesHandler } from './queries';

@ApiBearerAuth()
@UseGuards(AuthenticatedGuard)
@ApiTags('Roles')
@Controller('roles')
export class RolesController {
    constructor(
        private readonly createRoleHandler: CreateRoleHandler,
        private readonly deleteRoleHandler: DeleteRoleHandler,
        private readonly updateRoleHandler: UpdateRoleHandler,
        private readonly getRoleHandler: GetRoleHandler,
        private readonly getRolesHandler: GetRolesHandler,
    ) {}

    @RequiredPermissions({ roles: { view: true } })
    @UseGuards(RequiredPermissionsGuard)
    @Get()
    getRoles(@Query() query: GetRolesRequestQuery): Promise<GetRolesResponse> {
        return this.getRolesHandler.execute(query);
    }

    @RequiredPermissions({ roles: { view: true } })
    @UseGuards(RequiredPermissionsGuard)
    @Get(':roleId')
    getRole(@Param() params: RoleIdParam): Promise<RoleResponse> {
        return this.getRoleHandler.execute(params.roleId);
    }

    @RequiredPermissions({ roles: { edit: true } })
    @UseGuards(RequiredPermissionsGuard)
    @Post()
    async createRole(
        @Body() body: CreateRoleRequest,
        @GetUserSession() session: UserSession,
    ): Promise<void> {
        await this.createRoleHandler.execute(body, session);
    }

    @RequiredPermissions({ roles: { edit: true } })
    @UseGuards(RequiredPermissionsGuard)
    @Put(':roleId')
    async updateRole(
        @Body() body: UpdateRoleRequest,
        @Param() params: RoleIdParam,
        @GetUserSession() session: UserSession,
    ): Promise<void> {
        await this.updateRoleHandler.execute(body, params.roleId, session);
    }

    @RequiredPermissions({ roles: { edit: true } })
    @UseGuards(RequiredPermissionsGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':roleId')
    async deleteRole(@Param() params: RoleIdParam): Promise<void> {
        await this.deleteRoleHandler.execute(params.roleId);
    }
}
