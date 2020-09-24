import { NestMiddleware, Injectable } from '@nestjs/common';
import { Response, Request } from 'express';

import { UserSession } from '../shared/constants';
import { AuthenticationQueries } from './authentication.queries';


@Injectable()
export class SessionSerializer implements NestMiddleware {
    constructor(private readonly authQueries: AuthenticationQueries) {}

    async use(req: { user: UserSession } & Request, _res: Response, next: () => void): Promise<void> {
        const userId = req.session.userId;
        if (!userId) {
            return next();
        }

        req.user = await this.authQueries.composeUserSession(userId);
        next();
    }
}
