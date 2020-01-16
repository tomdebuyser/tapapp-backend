import {
    Controller,
    Post,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import {
    ResetPasswordRequest,
    LoginRequest,
    LoggedInUserResponse,
} from './dto';
import { AuthenticationService } from './authentication.service';
import { UserSession } from '../_shared/decorators/user-session.decorator';
import { IUserSession } from '../_shared/constants';
import { AuthenticationQueries } from './authentication.queries';

@ApiTags('auth')
@Controller('auth')
export class AuthenticationController {
    constructor(
        private readonly authService: AuthenticationService,
        private readonly authQueries: AuthenticationQueries,
    ) {}

    @UseGuards(AuthGuard('local'))
    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(
        @UserSession() session: IUserSession,
        // body is not used, but here for swagger docs
        @Body() _body: LoginRequest,
    ): Promise<LoggedInUserResponse> {
        return this.authQueries.getLoggedInUser(session);
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Post('reset-password')
    resetPassword(@Body() body: ResetPasswordRequest): Promise<void> {
        return this.authService.resetPassword(body);
    }
}
