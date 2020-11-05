import { Injectable } from '@nestjs/common';

import { UserRepository } from '@libs/models';
import { LoggerService } from '@libs/logger';
import { IHandler } from '@libs/common';
import { CannotDeleteCurrentUser, UserNotFound } from '../users.errors';
import { UserSession } from '../../shared/constants';
import { UserIdParam } from '../dto';

const context = 'DeleteUserHandler';

export type DeleteUserCommand = {
    data: UserIdParam;
    session: UserSession;
};

@Injectable()
export class DeleteUserHandler implements IHandler<DeleteUserCommand> {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly logger: LoggerService,
    ) {}

    async execute({ data, session }: DeleteUserCommand): Promise<void> {
        const { userId } = data;

        // The user should already exist
        const existingUser = await this.userRepository.findOne(userId);
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
