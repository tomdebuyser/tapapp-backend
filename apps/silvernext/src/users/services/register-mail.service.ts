import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User, UserRepository, UserState } from '@libs/models';
import { MailerService } from '@libs/mailer';
import { LoggerService } from '@libs/logger';
import { UserSession } from '../../shared/constants';

const context = 'RegisterMailService';

@Injectable()
export class RegisterMailService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
        private readonly mailerService: MailerService,
        private readonly logger: LoggerService,
    ) {}

    async sendMail(user: User, session: UserSession): Promise<void> {
        // Create a resetToken for the user
        const resetToken = await this.jwtService.signAsync(
            { email: user.email },
            { expiresIn: '1d' },
        );

        await this.userRepository.update(user.id, {
            resetToken,
            state: UserState.Registering,
            updatedBy: session.email,
        });

        // Send mail to inform user
        return this.mailerService
            .sendRegisterMail(user, session.email, resetToken)
            .catch(() =>
                this.logger.warn('Sending registration mail failed', {
                    context,
                }),
            );
    }
}
