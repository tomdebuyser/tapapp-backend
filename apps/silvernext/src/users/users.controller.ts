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
import { AuthenticatedGuard, RequiredPermissionsGuard } from '../shared/guards';
import { GetUserSession, RequiredPermissions } from '../shared/decorators';
import { UserSession } from '../shared/constants';
import {
    CreateUserHandler,
    DeactivateUserHandler,
    DeleteUserHandler,
    ResendRegisterMailHandler,
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
        private readonly resendRegisterMailHandler: ResendRegisterMailHandler,
        private readonly updateUserHandler: UpdateUserHandler,
        private readonly getUserHandler: GetUserHandler,
        private readonly getUsersHandler: GetUsersHandler,
    ) {}

    @RequiredPermissions({ users: { view: true } })
    @UseGuards(RequiredPermissionsGuard)
    @Get()
    getUsers(@Query() query: GetUsersRequestQuery): Promise<GetUsersResponse> {
        return this.getUsersHandler.execute(query);
    }

    @RequiredPermissions({ users: { view: true } })
    @Get(':userId')
    getUser(@Param() params: UserIdParam): Promise<UserResponse> {
        return this.getUserHandler.execute(params.userId);
    }

    @RequiredPermissions({ users: { edit: true } })
    @UseGuards(RequiredPermissionsGuard)
    @Post()
    async createUser(
        @Body() body: CreateUserRequest,
        @GetUserSession() session: UserSession,
    ): Promise<void> {
        await this.createUserHandler.execute(body, session);
    }

    @RequiredPermissions({ users: { edit: true } })
    @UseGuards(RequiredPermissionsGuard)
    @Put(':userId')
    async updateUser(
        @Body() body: UpdateUserRequest,
        @Param() params: UserIdParam,
        @GetUserSession() session: UserSession,
    ): Promise<void> {
        await this.updateUserHandler.execute(body, params.userId, session);
    }

    @RequiredPermissions({ users: { edit: true } })
    @UseGuards(RequiredPermissionsGuard)
    @Delete(':userId')
    async deleteUser(
        @Param() params: UserIdParam,
        @GetUserSession() session: UserSession,
    ): Promise<void> {
        await this.deleteUserHandler.execute(params.userId, session);
    }

    @RequiredPermissions({ users: { edit: true } })
    @UseGuards(RequiredPermissionsGuard)
    @HttpCode(HttpStatus.OK)
    @Post(':userId/resend-register-mail')
    async resendRegisterMail(
        @Param() params: UserIdParam,
        @GetUserSession() session: UserSession,
    ): Promise<void> {
        await this.resendRegisterMailHandler.execute(params.userId, session);
    }

    @RequiredPermissions({ users: { edit: true } })
    @UseGuards(RequiredPermissionsGuard)
    @HttpCode(HttpStatus.OK)
    @Post(':userId/deactivate')
    async deactivateUser(
        @Param() params: UserIdParam,
        @GetUserSession() session: UserSession,
    ): Promise<void> {
        await this.deactivateUserHandler.execute(params.userId, session);
    }
}
