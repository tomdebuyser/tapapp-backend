import {
    ExecutionContext,
    Injectable,
    CanActivate,
    UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

import { UserState } from '@libs/database';
import { IUserSession } from '../constants';
import { destroyExpressSession } from '../../session.middleware';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse<Response>();
        const session: IUserSession = request.user;
        const isAuthenticated =
            request.isAuthenticated() && session?.state === UserState.Active;
        if (!isAuthenticated) {
            await destroyExpressSession(request, response);
            // We throw an UnauthorizedException because by not doing it, a ForbiddenException is returned to the client
            throw new UnauthorizedException();
        }
        return isAuthenticated;
    }
}
