import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserRepository } from '@libs/models';
import { MailerService } from '@libs/mailer';
import { LoggerService } from '@libs/logger';
import { RequestPasswordResetRequest } from '../dto';

const context = 'RequestPasswordResetHandler';

@Injectable()
export class RequestPasswordResetHandler {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
        private readonly mailerService: MailerService,
        private readonly logger: LoggerService,
    ) {}

    async execute(body: RequestPasswordResetRequest): Promise<void> {
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
        await this.userRepository.update(user.id, {
            resetToken,
            updatedBy: user.email,
        });

        // Send mail to inform user
        this.mailerService
            .sendRequestPasswordResetMail(user, resetToken)
            .catch(() =>
                this.logger.error(
                    'Sending request password reset mail failed',
                    {
                        context,
                    },
                ),
            );
    }
}
