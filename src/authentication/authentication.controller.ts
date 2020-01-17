import {
    Controller,
    Post,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
    Get,
    Req,
    Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import {
    ResetPasswordRequest,
    LoginRequest,
    LoggedInUserResponse,
    RequestPasswordResetRequest,
} from './dto';
import { AuthenticationService } from './authentication.service';
import { IUserSession } from '../_shared/constants';
import { AuthenticationQueries } from './authentication.queries';
import { LoginGuard, AuthenticatedGuard } from '../_shared/guards';
import { UserSession, Origin } from '../_shared/decorators';

@ApiTags('auth')
@Controller('auth')
export class AuthenticationController {
    constructor(
        private readonly authService: AuthenticationService,
        private readonly authQueries: AuthenticationQueries,
    ) {}

    @UseGuards(LoginGuard)
    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(
        // body is not used, but here for swagger docs
        @Body() _body: LoginRequest,
        @UserSession() session: IUserSession,
    ): Promise<LoggedInUserResponse> {
        return this.authQueries.getLoggedInUser(session.userId);
    }

    @UseGuards(AuthenticatedGuard)
    @Get('authenticate')
    authenticate(
        @UserSession() session: IUserSession,
    ): Promise<LoggedInUserResponse> {
        return this.authQueries.getLoggedInUser(session.userId);
    }

    @UseGuards(AuthenticatedGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Post('logout')
    // Using any because the build fails when using passport types for the request
    // eslint-disable-next-line
    logout(@Req() request: any, @Res() response: Response): void {
        request.session.destroy(() => {
            request.logout();
            response.clearCookie('connect.sid');
            response.send();
        });
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Post('request-password-reset')
    requestPasswordReset(
        @Body() body: RequestPasswordResetRequest,
        @Origin() origin: string,
    ): Promise<void> {
        return this.authService.requestPasswordReset(body, origin);
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Post('reset-password')
    resetPassword(@Body() body: ResetPasswordRequest): Promise<void> {
        return this.authService.resetPassword(body);
    }
}
