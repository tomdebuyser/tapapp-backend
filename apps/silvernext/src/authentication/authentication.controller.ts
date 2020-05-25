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

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(
        @Body() body: LoginRequest,
        @Req() request: Request,
    ): Promise<AuthenticationUserResponse> {
        const user = await this.authService.login(body.username, body.password);

        // Add authenticated user's id to session cookie
        request.session.userId = user.id;

        return this.authQueries.getAuthenticatedUser(user.id);
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
    async requestPasswordReset(
        @Body() body: RequestPasswordResetRequest,
        @Origin() origin: string,
    ): Promise<void> {
        await this.authService.requestPasswordReset(body, origin);
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Post('reset-password')
    async resetPassword(@Body() body: ResetPasswordRequest): Promise<void> {
        await this.authService.resetPassword(body);
    }

    @Post('change-password')
    async changePassword(
        @Body() body: ChangePasswordRequest,
        @UserSession() session: IUserSession,
    ): Promise<void> {
        await this.authService.changePassword(body, session.userId);
    }
}
