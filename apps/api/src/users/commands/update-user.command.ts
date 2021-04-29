import { Injectable } from '@nestjs/common';

import { UserRepository } from '@libs/models';
import { LoggerService } from '@libs/logger';
import { IHandler } from '@libs/common';
import { UpdateUserRequest, UserIdParam } from '../dto';
import { UserNotFound } from '../users.errors';
import { UserSession } from '../../shared/constants';

const context = 'UpdateUserHandler';

export type UpdateUserCommand = {
    data: UpdateUserRequest & UserIdParam;
    session: UserSession;
};

@Injectable()
export class UpdateUserHandler implements IHandler<UpdateUserCommand> {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly logger: LoggerService,
    ) {}

    async execute({ data, session }: UpdateUserCommand): Promise<string> {
        const { userId } = data;

        // The user should already exist
        const existingUser = await this.userRepository.findOne(userId);
        if (!existingUser) {
            this.logger.warn('Failed to update: user with id not found', {
                context,
                userId,
            });
            throw new UserNotFound();
        }

        const { name } = data;
        existingUser.name = name;
        existingUser.updatedBy = session.email;

        await this.userRepository.save(existingUser);
        return existingUser.id;
    }
}
