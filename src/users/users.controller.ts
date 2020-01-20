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
import { AuthenticatedGuard } from '../_shared/guards';
import { Origin, UserSession } from '../_shared/decorators';
import { IUserSession } from '../_shared/constants';

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

    @HttpCode(HttpStatus.NO_CONTENT)
    @Post(':userId/resend-register-mail')
    resendRegisterMail(
        @Param() params: UserIdParam,
        @UserSession() session: IUserSession,
        @Origin() origin: string,
    ): Promise<void> {
        return this.usersService.resendRegisterMail(
            params.userId,
            session,
            origin,
        );
    }
}
