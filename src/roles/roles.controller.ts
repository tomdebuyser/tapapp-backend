import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
    CreateRoleRequest,
    GetRolesResponse,
    GetRolesRequestQuery,
} from './dto';
import { RolesService } from './roles.service';
import { RolesQueries } from './roles.queries';

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
    createRole(@Body() body: CreateRoleRequest): Promise<void> {
        return this.rolesService.createRole(body);
    }
}
