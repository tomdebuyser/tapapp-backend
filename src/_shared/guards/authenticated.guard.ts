import {
    ExecutionContext,
    Injectable,
    CanActivate,
    UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse<Response>();
        const isAuthenticated = request.isAuthenticated();
        if (!isAuthenticated) {
            response.clearCookie('connect.sid');
            // We throw an UnauthorizedException because by not doing it, a ForbiddenException is returned to the client
            throw new UnauthorizedException();
        }
        return isAuthenticated;
    }
}
