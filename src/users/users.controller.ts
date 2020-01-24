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
    Patch,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

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
import {
    Origin,
    UserSession,
    RequiredPermissions,
} from '../_shared/decorators';
import { IUserSession } from '../_shared/constants';

@UseGuards(AuthenticatedGuard)
@ApiTags('users')
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

    @RequiredPermissions({ users: { edit: true } })
    @UseGuards(RequiredPermissionsGuard)
    @Post()
    async createUser(
        @Body() body: CreateUserRequest,
        @UserSession() session: IUserSession,
        @Origin() origin: string,
    ): Promise<UserResponse> {
        const userId = await this.usersService.createUser(
            body,
            session,
            origin,
        );
        return this.usersQueries.getUser(userId);
    }

    @RequiredPermissions({ users: { edit: true } })
    @UseGuards(RequiredPermissionsGuard)
    @Patch(':userId')
    async updateUser(
        @Body() body: UpdateUserRequest,
        @Param() params: UserIdParam,
        @UserSession() session: IUserSession,
    ): Promise<UserResponse> {
        // Only the provided properties will be updated
        const userId = await this.usersService.updateUser(
            body,
            params.userId,
            session,
        );
        return this.usersQueries.getUser(userId);
    }

    @RequiredPermissions({ users: { edit: true } })
    @UseGuards(RequiredPermissionsGuard)
    @HttpCode(HttpStatus.OK)
    @Post(':userId/resend-register-mail')
    async resendRegisterMail(
        @Param() params: UserIdParam,
        @UserSession() session: IUserSession,
        @Origin() origin: string,
    ): Promise<UserResponse> {
        const userId = await this.usersService.resendRegisterMail(
            params.userId,
            session,
            origin,
        );
        return this.usersQueries.getUser(userId);
    }

    @RequiredPermissions({ users: { edit: true } })
    @UseGuards(RequiredPermissionsGuard)
    @HttpCode(HttpStatus.OK)
    @Post(':userId/deactivate')
    async deactivateUser(
        @Param() params: UserIdParam,
        @UserSession() session: IUserSession,
    ): Promise<UserResponse> {
        const userId = await this.usersService.deactivateUser(
            params.userId,
            session,
        );
        return this.usersQueries.getUser(userId);
    }
}
