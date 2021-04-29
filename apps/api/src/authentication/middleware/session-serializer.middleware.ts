import { NestMiddleware, Injectable } from '@nestjs/common';
import { Response, Request } from 'express';

import { UserRepository } from '@libs/models';
import { UserSession } from '../../shared/constants';

@Injectable()
export class SessionSerializer implements NestMiddleware {
    constructor(private readonly userRepository: UserRepository) {}

    // Overwriting session because the merged interfaces are broken in our CI/CD.
    async use(
        req: { user: UserSession; session: { userId: string } } & Request,
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
            relations: ['organisation'],
        });
        if (!user) return null;
        return {
            userId: user.id,
            type: user.type,
            isActive: user.isActive,
            email: user.email,
            name: user.name,
            organisation: {
                id: user.organisation?.id,
                isActive: user.organisation?.isActive,
            },
        };
    }
}
