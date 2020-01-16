import {
    Controller,
    Post,
    Body,
    Get,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import {
    CreateUserRequest,
    GetUsersResponse,
    GetUsersRequestQuery,
} from './dto';
import { UsersService } from './users.service';
import { UsersQueries } from './users.queries';
import { AuthenticatedGuard } from '../_shared/guards';

@UseGuards(AuthenticatedGuard)
@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly usersQueries: UsersQueries,
    ) {}

    @Get()
    getUsers(@Query() query: GetUsersRequestQuery): Promise<GetUsersResponse> {
        return this.usersQueries.getUsers(query);
    }

    @Post()
    createUser(
        @Req() request: Request,
        @Body() body: CreateUserRequest,
    ): Promise<void> {
        return this.usersService.createUser(
            body,
            request.headers.origin as string,
        );
    }
}
