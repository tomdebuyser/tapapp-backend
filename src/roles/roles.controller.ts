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
import { ApiTags } from '@nestjs/swagger';

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
import { AuthenticatedGuard } from '../_shared/guards';
import { UserSession } from '../_shared/decorators';
import { IUserSession } from '../_shared/constants';

@UseGuards(AuthenticatedGuard)
@ApiTags('roles')
@Controller('roles')
export class RolesController {
    constructor(
        private readonly rolesService: RolesService,
        private readonly rolesQueries: RolesQueries,
    ) {}

    @Get()
    getRoles(@Query() query: GetRolesRequestQuery): Promise<GetRolesResponse> {
        return this.rolesQueries.getRoles(query);
    }

    @Post()
    async createRole(
        @Body() body: CreateRoleRequest,
        @UserSession() session: IUserSession,
    ): Promise<RoleResponse> {
        const roleId = await this.rolesService.createRole(body, session);
        return this.rolesQueries.getRole(roleId);
    }

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

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':roleId')
    deleteRole(@Param() params: RoleIdParam): Promise<void> {
        return this.rolesService.deleteRole(params.roleId);
    }
}
