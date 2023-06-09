import {
    ExecutionContext,
    Injectable,
    CanActivate,
    UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';

import { UserSession } from '../constants';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse<Response>();
        const session: UserSession = request.user;

        if (
            !session?.isActive ||
            (session?.organisation && !session.organisation.isActive)
        ) {
            await destroyExpressSession(request, response);
            // We throw an UnauthorizedException because by not doing it, a ForbiddenException is returned to the client
            throw new UnauthorizedException();
        }

        return true;
    }
}

/**
 * This function invalidates everything that is related to a session: clear cookie, remove cookie from redis
 */
export function destroyExpressSession(
    request: Request,
    response: Response,
): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            request.session.destroy(() => {
                response.clearCookie('connect.sid');
                resolve();
            });
        } catch (error) {
            reject(error);
        }
    });
}
