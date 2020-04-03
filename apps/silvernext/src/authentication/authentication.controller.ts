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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

import {
    ResetPasswordRequest,
    LoginRequest,
    AuthenticationUserResponse,
    RequestPasswordResetRequest,
    ChangePasswordRequest,
} from './dto';
import { AuthenticationService } from './authentication.service';
import { IUserSession } from '../_shared/constants';
import { AuthenticationQueries } from './authentication.queries';
import { AuthenticatedGuard, destroyExpressSession } from '../_shared/guards';
import { UserSession, Origin } from '../_shared/decorators';

@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
    constructor(
        private readonly authService: AuthenticationService,
        private readonly authQueries: AuthenticationQueries,
    ) {}

    @UseGuards(AuthGuard())
    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(
        // body is not used, but here for swagger docs
        @Body() _body: LoginRequest,
        @UserSession() session: IUserSession,
    ): IUserSession {
        return session;
    }

    @ApiBearerAuth()
    @UseGuards(AuthenticatedGuard)
    @Get('me')
    authenticate(
        @UserSession() session: IUserSession,
    ): Promise<AuthenticationUserResponse> {
        return this.authQueries.getAuthenticatedUser(session.userId);
    }

    @ApiBearerAuth()
    @UseGuards(AuthenticatedGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Post('logout')
    async logout(
        @Req() request: Request,
        @Res() response: Response,
    ): Promise<void> {
        await destroyExpressSession(request, response);
        response.send();
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

    @Post('change-password')
    changePassword(
        @Body() body: ChangePasswordRequest,
        @UserSession() session: IUserSession,
    ): Promise<void> {
        return this.authService.changePassword(body, session.userId);
    }
}
