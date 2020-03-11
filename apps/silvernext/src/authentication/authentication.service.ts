import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

import { UserRepository, User, UserState } from '@libs/database';
import { MailerService } from '@libs/mailer';
import { LoggerService } from '@libs/logger';
import { ResetPasswordRequest, RequestPasswordResetRequest } from './dto';
import { ResetTokenInvalid, ResetTokenExpired } from './errors';
import { requestPasswordResetMessage } from '../_shared/messages';
import { UserStateNotAllowed } from '../_shared/guards';

const context = 'Authentication';

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
        private readonly mailerService: MailerService,
        private readonly logger: LoggerService,
    ) {}

    async login(email: string, password: string): Promise<User> {
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

    async requestPasswordReset(
        body: RequestPasswordResetRequest,
        origin: string,
    ): Promise<void> {
        const { email } = body;

        // If the user is not found, just do nothing
        const user = await this.userRepository.findOne({ email });
        if (!user) {
            this.logger.warn('Password reset for unknown email', {
                context,
                email,
            });
            return;
        }

        // Add resetToken to the user
        const resetToken = await this.jwtService.signAsync(
            { email },
            { expiresIn: '1d' },
        );
        user.resetToken = resetToken;
        user.updatedBy = user.email;
        await this.userRepository.save(user);

        // Send mail to inform user
        this.mailerService.sendMail(
            requestPasswordResetMessage(email, resetToken, origin),
        );
    }

    async resetPassword(body: ResetPasswordRequest): Promise<void> {
        const { newPassword, resetToken } = body;

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
        const hashedPassword = await this.hashPassword(newPassword);
        user.state = UserState.Active;
        user.password = hashedPassword;
        user.resetToken = null;
        user.updatedBy = user.email;

        await this.userRepository.save(user);
    }

    hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }
}
