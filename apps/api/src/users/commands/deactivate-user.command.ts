import { Injectable } from '@nestjs/common';

import { UserRepository } from '@libs/models';
import { LoggerService } from '@libs/logger';
import { IHandler } from '@libs/common';
import { UserNotFound } from '../users.errors';
import { UserSession } from '../../shared/constants';
import { UserIdParam } from '../dto';

const context = 'DeactivateUserHandler';

export type DeactivateUserCommand = {
    data: UserIdParam;
    session: UserSession;
};

@Injectable()
export class DeactivateUserHandler implements IHandler<DeactivateUserCommand> {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly logger: LoggerService,
    ) {}

    async execute({ data, session }: DeactivateUserCommand): Promise<string> {
        const { userId } = data;

        // The user should already exist
        const existingUser = await this.userRepository.findOne(userId);
        if (!existingUser) {
            this.logger.warn('Failed to deactivate: user with id not found', {
                context,
                userId,
            });
            throw new UserNotFound();
        }

        // Mark the user inactive
        await this.userRepository.update(userId, {
            isActive: false,
            updatedBy: session.email,
        });

        // TODO: Remove all cookies for this user - Therefore we should store a set of cookies for each user in redis (check astrum)

        return userId;
    }
}
