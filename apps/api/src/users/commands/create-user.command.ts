import { Injectable } from '@nestjs/common';

import { UserRepository, User } from '@libs/models';
import { LoggerService } from '@libs/logger';
import { IHandler } from '@libs/common';
import { CreateUserRequest } from '../dto';
import { EmailAlreadyInUse } from '../users.errors';
import { UserSession } from '../../shared/constants';

const context = 'CreateUserHandler';

export type CreateUserCommand = {
    data: CreateUserRequest;
    session: UserSession;
};

@Injectable()
export class CreateUserHandler implements IHandler<CreateUserCommand> {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly logger: LoggerService,
    ) {}

    async execute({ data, session }: CreateUserCommand): Promise<string> {
        const { email, name } = data;

        // The user should not exist yet
        const existingUser = await this.userRepository.findOne({
            email,
        });
        if (existingUser) {
            this.logger.warn('Failed to create: user email already in use', {
                context,
                email,
            });
            throw new EmailAlreadyInUse();
        }

        // Create the user
        const user = User.create({
            email,
            name,
            createdBy: session.email,
        });
        await this.userRepository.save(user);

        return user.id;
    }
}
