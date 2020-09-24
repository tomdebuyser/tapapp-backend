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
import { RolesService } from './roles.service';
import { RolesQueries } from './roles.queries';
import { AuthenticatedGuard, RequiredPermissionsGuard } from '../shared/guards';
import { GetUserSession, RequiredPermissions } from '../shared/decorators';
import { UserSession } from '../shared/constants';

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

    @RequiredPermissions({ roles: { view: true } })
    @UseGuards(RequiredPermissionsGuard)
    @Get(':roleId')
    getRole(@Param('roleId') roleId: string): Promise<RoleResponse> {
        return this.rolesQueries.getRole(roleId);
    }

    @RequiredPermissions({ roles: { edit: true } })
    @UseGuards(RequiredPermissionsGuard)
    @Post()
    async createRole(
        @Body() body: CreateRoleRequest,
        @GetUserSession() session: UserSession,
    ): Promise<void> {
        await this.rolesService.createRole(body, session);
    }

    @RequiredPermissions({ roles: { edit: true } })
    @UseGuards(RequiredPermissionsGuard)
    @Put(':roleId')
    async updateRole(
        @Body() body: UpdateRoleRequest,
        @Param() params: RoleIdParam,
        @GetUserSession() session: UserSession,
    ): Promise<void> {
        await this.rolesService.updateRole(body, params.roleId, session);
    }

    @RequiredPermissions({ roles: { edit: true } })
    @UseGuards(RequiredPermissionsGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':roleId')
    async deleteRole(@Param() params: RoleIdParam): Promise<void> {
        await this.rolesService.deleteRole(params.roleId);
    }
}
