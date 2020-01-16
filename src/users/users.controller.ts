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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
    CreateUserRequest,
    GetUsersResponse,
    GetUsersRequestQuery,
    ResendRegisterMailRequestParams,
} from './dto';
import { UsersService } from './users.service';
import { UsersQueries } from './users.queries';
import { AuthenticatedGuard } from '../_shared/guards';
import { Origin } from '../_shared/decorators';

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
        @Body() body: CreateUserRequest,
        @Origin() origin: string,
    ): Promise<void> {
        return this.usersService.createUser(body, origin);
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Post(':userId/resend-register-mail')
    resendRegisterMail(
        @Param() params: ResendRegisterMailRequestParams,
        @Origin() origin: string,
    ): Promise<void> {
        return this.usersService.resendRegisterMail(params.userId, origin);
    }
}
