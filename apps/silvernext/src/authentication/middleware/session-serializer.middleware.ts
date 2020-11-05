import { NestMiddleware, Injectable } from '@nestjs/common';
import { Response, Request } from 'express';

import { UserRepository } from '@libs/models';
import { UserSession } from '../../shared/constants';
import {
    createDefaultPermissions,
    permissionsFromRoles,
} from '../../shared/util';

@Injectable()
export class SessionSerializer implements NestMiddleware {
    constructor(private readonly userRepository: UserRepository) {}

    async use(
        req: { user: UserSession } & Request,
        _res: Response,
        next: () => void,
    ): Promise<void> {
        const userId = req.session.userId;
        if (!userId) {
            return next();
        }

        req.user = await this.composeUserSession(userId);
        next();
    }

    private async composeUserSession(userId: string): Promise<UserSession> {
        const user = await this.userRepository.findOne(userId, {
            relations: ['roles'],
        });
        if (!user) return null;
        return {
            userId: user.id,
            email: user.email,
            state: user.state,
            firstName: user.firstName,
            lastName: user.lastName,
            permissions: createDefaultPermissions(
                permissionsFromRoles(user.roles),
            ),
        };
    }
}
