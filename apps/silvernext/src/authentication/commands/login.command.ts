import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UserRepository, User, UserState } from '@libs/models';
import { LoggerService } from '@libs/logger';
import { UserStateNotAllowed } from '../authentication.errors';

const context = 'LoginHandler';

@Injectable()
export class LoginHandler {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly logger: LoggerService,
    ) {}

    async execute(email: string, password: string): Promise<User> {
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
