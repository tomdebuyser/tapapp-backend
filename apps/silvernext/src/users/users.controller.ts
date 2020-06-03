import {
    Controller,
    Post,
    Body,
    Get,
    Query,
    UseGuards,
    Param,
    HttpCode,
    HttpStatus,
    Put,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import {
    CreateUserRequest,
    GetUsersResponse,
    GetUsersRequestQuery,
    UpdateUserRequest,
    UserIdParam,
    UserResponse,
} from './dto';
import { UsersService } from './users.service';
import { UsersQueries } from './users.queries';
import {
    AuthenticatedGuard,
    RequiredPermissionsGuard,
} from '../_shared/guards';
import { UserSession, RequiredPermissions } from '../_shared/decorators';
import { IUserSession } from '../_shared/constants';

@ApiBearerAuth()
@UseGuards(AuthenticatedGuard)
@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly usersQueries: UsersQueries,
    ) {}

    @RequiredPermissions({ users: { view: true } })
    @UseGuards(RequiredPermissionsGuard)
    @Get()
    getUsers(@Query() query: GetUsersRequestQuery): Promise<GetUsersResponse> {
        return this.usersQueries.getUsers(query);
    }

    @RequiredPermissions({ users: { view: true } })
    @Get(':userId')
    getUser(@Param('userId') userId: string): Promise<UserResponse> {
        return this.usersQueries.getUser(userId);
    }

    @RequiredPermissions({ users: { edit: true } })
    @UseGuards(RequiredPermissionsGuard)
    @Post()
    async createUser(
        @Body() body: CreateUserRequest,
        @UserSession() session: IUserSession,
    ): Promise<void> {
        await this.usersService.createUser(body, session);
    }

    @RequiredPermissions({ users: { edit: true } })
    @UseGuards(RequiredPermissionsGuard)
    @Put(':userId')
    async updateUser(
        @Body() body: UpdateUserRequest,
        @Param() params: UserIdParam,
        @UserSession() session: IUserSession,
    ): Promise<void> {
        await this.usersService.updateUser(body, params.userId, session);
    }

    @RequiredPermissions({ users: { edit: true } })
    @UseGuards(RequiredPermissionsGuard)
    @HttpCode(HttpStatus.OK)
    @Post(':userId/resend-register-mail')
    async resendRegisterMail(
        @Param() params: UserIdParam,
        @UserSession() session: IUserSession,
    ): Promise<void> {
        await this.usersService.resendRegisterMail(params.userId, session);
    }

    @RequiredPermissions({ users: { edit: true } })
    @UseGuards(RequiredPermissionsGuard)
    @HttpCode(HttpStatus.OK)
    @Post(':userId/deactivate')
    async deactivateUser(
        @Param() params: UserIdParam,
        @UserSession() session: IUserSession,
    ): Promise<void> {
        await this.usersService.deactivateUser(params.userId, session);
    }
}
