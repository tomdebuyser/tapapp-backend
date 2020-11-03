import { Injectable } from '@nestjs/common';

import { UserRepository, UserState } from '@libs/models';
import { LoggerService } from '@libs/logger';
import { UserNotFound, AccountAlreadyActive } from '../users.errors';
import { UserSession } from '../../shared/constants';
import { RegisterMailService } from '../services/register-mail.service';

const context = 'ResendRegisterMailHandler';

@Injectable()
export class ResendRegisterMailHandler {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly registerMailService: RegisterMailService,
        private readonly logger: LoggerService,
    ) {}

    async execute(userId: string, session: UserSession): Promise<string> {
        // The user should exist and be not active yet
        const existingUser = await this.userRepository.findOne({
            id: userId,
        });
        if (!existingUser) {
            this.logger.warn(
                'Failed to resend register email: user with id not found',
                {
                    context,
                    userId,
                },
            );
            throw new UserNotFound();
        }
        if (existingUser.state === UserState.Active) {
            throw new AccountAlreadyActive();
        }

        await this.registerMailService.sendMail(existingUser, session);

        return existingUser.id;
    }
}
