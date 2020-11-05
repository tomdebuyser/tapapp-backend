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
import { UserSession } from '../shared/constants';
import { AuthenticatedGuard, destroyExpressSession } from '../shared/guards';
import { GetUserSession } from '../shared/decorators';
import {
    ChangePasswordHandler,
    LoginHandler,
    RequestPasswordResetHandler,
    ResetPasswordHandler,
} from './commands';
import { GetAuthenticatedUserHandler } from './queries';

@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
    constructor(
        private readonly changePasswordHandler: ChangePasswordHandler,
        private readonly loginHandler: LoginHandler,
        private readonly requestPasswordResetHandler: RequestPasswordResetHandler,
        private readonly resetPasswordHandler: ResetPasswordHandler,
        private readonly getAuthenticatedUserHandler: GetAuthenticatedUserHandler,
    ) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(
        @Body() body: LoginRequest,
        @Req() request: Request,
    ): Promise<AuthenticationUserResponse> {
        const user = await this.loginHandler.execute({ data: body });

        // Add authenticated user's id to session cookie
        request.session.userId = user.id;

        return this.getAuthenticatedUserHandler.execute({
            data: { userId: user.id },
        });
    }

    @ApiBearerAuth()
    @UseGuards(AuthenticatedGuard)
    @Get('me')
    authenticate(
        @GetUserSession() session: UserSession,
    ): Promise<AuthenticationUserResponse> {
        return this.getAuthenticatedUserHandler.execute({
            data: { userId: session.userId },
        });
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
    ): Promise<void> {
        await this.requestPasswordResetHandler.execute({ data: body });
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Post('reset-password')
    async resetPassword(@Body() body: ResetPasswordRequest): Promise<void> {
        await this.resetPasswordHandler.execute({ data: body });
    }

    @Post('change-password')
    async changePassword(
        @Body() body: ChangePasswordRequest,
        @GetUserSession() session: UserSession,
    ): Promise<void> {
        await this.changePasswordHandler.execute({ data: body, session });
    }
}
