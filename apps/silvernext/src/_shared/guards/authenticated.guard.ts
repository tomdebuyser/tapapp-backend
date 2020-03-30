import {
    ExecutionContext,
    Injectable,
    CanActivate,
    UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

import { UserState } from '@libs/database';
import { IUserSession } from '../constants';

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

/**
 * This function invalidates everything that is related to a session: passport logout, clear cookie, remove cookie from redis
 */
export function destroyExpressSession(
    // Using any because the build fails when using passport types for the request
    // eslint-disable-next-line
    request: any,
    response: Response,
): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            request.session.destroy(() => {
                request.logout();
                response.clearCookie('connect.sid');
                resolve();
            });
        } catch (error) {
            reject(error);
        }
    });
}
