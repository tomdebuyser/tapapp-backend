import { Injectable } from '@nestjs/common';

import { UserRepository, UserState } from '@libs/models';
import { LoggerService } from '@libs/logger';
import { UserNotFound } from '../users.errors';
import { UserSession } from '../../shared/constants';

const context = 'DeactivateUserHandler';

@Injectable()
export class DeactivateUserHandler {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly logger: LoggerService,
    ) {}

    async execute(userId: string, session: UserSession): Promise<string> {
        // The user should already exist
        const existingUser = await this.userRepository.findOne(userId);
        if (!existingUser) {
            this.logger.warn('Failed to deactivate: user with id not found', {
                context,
                userId,
            });
            throw new UserNotFound();
        }

        // Set the state to inactive
        await this.userRepository.update(userId, {
            state: UserState.Inactive,
            resetToken: null,
            updatedBy: session.email,
        });

        // TODO: Remove all cookies for this user - Therefore we should store a set of cookies for each user in redis (check astrum)

        return userId;
    }
}
