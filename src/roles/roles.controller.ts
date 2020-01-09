import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GetRolesResponse, GetRolesRequestQuery } from './dto';
import { RolesQueries } from './roles.queries';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
    constructor(private readonly rolesQueries: RolesQueries) {}

    @Get()
    getRoles(@Query() query: GetRolesRequestQuery): Promise<GetRolesResponse> {
        return this.rolesQueries.getRoles(query);
    }
}
