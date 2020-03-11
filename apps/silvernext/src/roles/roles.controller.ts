import {
    Controller,
    Post,
    Body,
    Get,
    Query,
    UseGuards,
    Patch,
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
import { RolesService } from './roles.service';
import { RolesQueries } from './roles.queries';
import {
    AuthenticatedGuard,
    RequiredPermissionsGuard,
} from '../_shared/guards';
import { UserSession, RequiredPermissions } from '../_shared/decorators';
import { IUserSession } from '../_shared/constants';

@ApiBearerAuth()
@UseGuards(AuthenticatedGuard)
@ApiTags('Roles')
@Controller('roles')
export class RolesController {
    constructor(
        private readonly rolesService: RolesService,
        private readonly rolesQueries: RolesQueries,
    ) {}

    @RequiredPermissions({ roles: { view: true } })
    @UseGuards(RequiredPermissionsGuard)
    @Get()
    getRoles(@Query() query: GetRolesRequestQuery): Promise<GetRolesResponse> {
        return this.rolesQueries.getRoles(query);
    }

    @RequiredPermissions({ roles: { edit: true } })
    @UseGuards(RequiredPermissionsGuard)
    @Post()
    async createRole(
        @Body() body: CreateRoleRequest,
        @UserSession() session: IUserSession,
    ): Promise<RoleResponse> {
        const roleId = await this.rolesService.createRole(body, session);
        return this.rolesQueries.getRole(roleId);
    }

    @RequiredPermissions({ roles: { edit: true } })
    @UseGuards(RequiredPermissionsGuard)
    @Patch(':roleId')
    async updateRole(
        @Body() body: UpdateRoleRequest,
        @Param() params: RoleIdParam,
        @UserSession() session: IUserSession,
    ): Promise<RoleResponse> {
        // Only the provided properties will be updated
        const roleId = await this.rolesService.updateRole(
            body,
            params.roleId,
            session,
        );
        return this.rolesQueries.getRole(roleId);
    }

    @RequiredPermissions({ roles: { edit: true } })
    @UseGuards(RequiredPermissionsGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':roleId')
    deleteRole(@Param() params: RoleIdParam): Promise<void> {
        return this.rolesService.deleteRole(params.roleId);
    }
}
