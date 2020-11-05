import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

import { UserRepository, UserState } from '@libs/models';
import { LoggerService } from '@libs/logger';
import { ResetPasswordRequest } from '../dto';
import {
    ResetTokenInvalid,
    ResetTokenExpired,
    UserStateNotAllowed,
} from '../authentication.errors';
import { IHandler } from '@libs/common';

const context = 'ResetPasswordHandler';

export type ResetPasswordCommand = {
    data: ResetPasswordRequest;
};

@Injectable()
export class ResetPasswordHandler implements IHandler<ResetPasswordCommand> {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
        private readonly logger: LoggerService,
    ) {}

    async execute({ data }: ResetPasswordCommand): Promise<void> {
        const { newPassword, resetToken } = data;

        // Check if token is still valid
        try {
            await this.jwtService.verifyAsync(resetToken);
        } catch (error) {
            this.logger.warn('Error verifying token for password reset', {
                context,
                error,
            });
            if (error instanceof TokenExpiredError) {
                throw new ResetTokenExpired();
            }
            throw new ResetTokenInvalid();
        }

        // Check if token is linked to a user
        const decoded = this.jwtService.decode(resetToken) as { email: string };
        const user = await this.userRepository.findOne({
            resetToken,
        });
        if (!user || user.email !== decoded.email) {
            this.logger.warn('Invalid reset token', {
                context,
                encodedToken: resetToken,
                decodedToken: decoded,
            });
            throw new ResetTokenInvalid();
        }

        // Check if the user is not inactive
        if (![UserState.Active, UserState.Registering].includes(user.state)) {
            this.logger.warn('This action is not allowed for this user', {
                context,
                state: user.state,
                allowedStates: [UserState.Active, UserState.Registering],
            });
            throw new UserStateNotAllowed();
        }

        // Update the user in the database
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.userRepository.update(user.id, {
            state: UserState.Active,
            password: hashedPassword,
            resetToken: null,
            updatedBy: user.email,
        });
    }
}
