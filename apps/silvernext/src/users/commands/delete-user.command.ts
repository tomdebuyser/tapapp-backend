import { Injectable } from '@nestjs/common';

import { UserRepository } from '@libs/models';
import { LoggerService } from '@libs/logger';
import { CannotDeleteCurrentUser, UserNotFound } from '../users.errors';
import { UserSession } from '../../shared/constants';

const context = 'DeleteUserHandler';

@Injectable()
export class DeleteUserHandler {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly logger: LoggerService,
    ) {}

    async execute(userId: string, session: UserSession): Promise<void> {
        // The user should already exist
        const existingUser = await this.userRepository.findOne({
            id: userId,
        });
        if (!existingUser) {
            this.logger.warn('Failed to delete: user with id not found', {
                context,
                userId,
            });
            throw new UserNotFound();
        }

        // Cannot delete the current logged in user
        if (userId === session.userId) {
            this.logger.warn('Failed to delete: user cannot delete himself', {
                context,
                userId,
            });
            throw new CannotDeleteCurrentUser();
        }

        await this.userRepository.delete(userId);
    }
}
