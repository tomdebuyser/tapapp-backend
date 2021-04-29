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
    Delete,
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
import { AuthenticatedGuard } from '../shared/guards';
import { GetUserSession } from '../shared/decorators';
import { UserSession } from '../shared/constants';
import {
    CreateUserHandler,
    DeactivateUserHandler,
    DeleteUserHandler,
    UpdateUserHandler,
} from './commands';
import { GetUserHandler, GetUsersHandler } from './queries';

@ApiBearerAuth()
@UseGuards(AuthenticatedGuard)
@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(
        private readonly createUserHandler: CreateUserHandler,
        private readonly deactivateUserHandler: DeactivateUserHandler,
        private readonly deleteUserHandler: DeleteUserHandler,
        private readonly updateUserHandler: UpdateUserHandler,
        private readonly getUserHandler: GetUserHandler,
        private readonly getUsersHandler: GetUsersHandler,
    ) {}

    @Get()
    getUsers(@Query() query: GetUsersRequestQuery): Promise<GetUsersResponse> {
        return this.getUsersHandler.execute({ data: query });
    }

    @Get(':userId')
    getUser(@Param() params: UserIdParam): Promise<UserResponse> {
        return this.getUserHandler.execute({ data: params });
    }

    @Post()
    async createUser(
        @Body() body: CreateUserRequest,
        @GetUserSession() session: UserSession,
    ): Promise<void> {
        await this.createUserHandler.execute({ data: body, session });
    }

    @Put(':userId')
    async updateUser(
        @Body() body: UpdateUserRequest,
        @Param() params: UserIdParam,
        @GetUserSession() session: UserSession,
    ): Promise<void> {
        await this.updateUserHandler.execute({
            data: { ...body, ...params },
            session,
        });
    }

    @Delete(':userId')
    async deleteUser(
        @Param() params: UserIdParam,
        @GetUserSession() session: UserSession,
    ): Promise<void> {
        await this.deleteUserHandler.execute({ data: params, session });
    }

    @HttpCode(HttpStatus.OK)
    @Post(':userId/deactivate')
    async deactivateUser(
        @Param() params: UserIdParam,
        @GetUserSession() session: UserSession,
    ): Promise<void> {
        await this.deactivateUserHandler.execute({ data: params, session });
    }
}
