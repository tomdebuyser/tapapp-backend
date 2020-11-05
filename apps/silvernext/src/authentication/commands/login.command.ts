import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UserRepository, User, UserState } from '@libs/models';
import { LoggerService } from '@libs/logger';
import { IHandler } from '@libs/common';
import { UserStateNotAllowed } from '../authentication.errors';
import { LoginRequest } from '../dto';

const context = 'LoginHandler';

export type LoginCommand = {
    data: LoginRequest;
};

@Injectable()
export class LoginHandler implements IHandler<LoginCommand> {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly logger: LoggerService,
    ) {}

    async execute({ data }: LoginCommand): Promise<User> {
        const { username: email, password } = data;

        // Try to find the user
        const user = await this.userRepository.findOne({ email });
        if (!user) {
            this.logger.warn('User not found', { context, email });
            throw new UnauthorizedException();
        }

        // Check if user is active
        if (![UserState.Active].includes(user.state)) {
            this.logger.warn('This action is not allowed for this user', {
                context,
                state: user.state,
                allowedStates: [UserState.Active],
            });
            throw new UserStateNotAllowed();
        }

        // Given password should match the stored hashed password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            this.logger.warn('Invalid password for login attempt', {
                context,
                email,
            });
            throw new UnauthorizedException();
        }

        return user;
    }
}
