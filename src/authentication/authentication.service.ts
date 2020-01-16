import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

import { UserRepository, User } from '../database';
import { ResetPasswordRequest } from './dto';
import { ResetTokenInvalid, ResetTokenExpired } from './errors';
import { UserState } from '../_shared/constants';

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
    ) {}

    async validateCredentials(email: string, password: string): Promise<User> {
        // Try to find the user
        const user = await this.userRepository.findOne({ email });
        if (!user) {
            throw new UnauthorizedException();
        }

        // Given password should match the stored hashed password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            throw new UnauthorizedException();
        }

        return user;
    }

    async resetPassword(body: ResetPasswordRequest): Promise<void> {
        const { newPassword, resetToken } = body;

        // Check if token is still valid
        try {
            await this.jwtService.verifyAsync(resetToken);
        } catch (error) {
            console.error(error);
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
            throw new ResetTokenInvalid();
        }

        // Update the user in the database
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.state = UserState.Active;
        user.password = hashedPassword;
        user.resetToken = null;

        await this.userRepository.save(user);
    }
}
