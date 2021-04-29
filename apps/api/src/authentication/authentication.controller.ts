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

import { LoginRequest, AuthenticationUserResponse } from './dto';
import { UserSession } from '../shared/constants';
import { AuthenticatedGuard, destroyExpressSession } from '../shared/guards';
import { GetUserSession } from '../shared/decorators';
import { LoginHandler } from './commands';
import { GetAuthenticatedUserHandler } from './queries';

@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
    constructor(
        private readonly loginHandler: LoginHandler,
        private readonly getAuthenticatedUserHandler: GetAuthenticatedUserHandler,
    ) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(
        @Body() body: LoginRequest,
        // Overwriting session because the merged interfaces are broken in our CI/CD.
        @Req() request: Request & { session: { userId: string } },
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
}
