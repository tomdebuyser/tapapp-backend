import { NestMiddleware, Injectable } from '@nestjs/common';
import { Response } from 'express';

import { AuthenticationQueries } from './authentication.queries';

@Injectable()
export class SessionSerializer implements NestMiddleware {
    constructor(private readonly authQueries: AuthenticationQueries) {}

    async use(req: any, _res: Response, next: () => void): Promise<void> {
        const userId = req.session.userId;
        if (!userId) {
            return next();
        }

        req.user = await this.authQueries.composeUserSession(userId);
        next();
    }
}
