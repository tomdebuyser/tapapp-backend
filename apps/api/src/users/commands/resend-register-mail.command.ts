import { Injectable } from '@nestjs/common';

import { UserRepository, UserState } from '@libs/models';
import { LoggerService } from '@libs/logger';
import { IHandler } from '@libs/common';
import { UserNotFound, AccountAlreadyActive } from '../users.errors';
import { UserSession } from '../../shared/constants';
import { RegisterMailService } from '../services/register-mail.service';
import { UserIdParam } from '../dto';

const context = 'ResendRegisterMailHandler';

export type ResendRegisterMailCommand = {
    data: UserIdParam;
    session: UserSession;
};

@Injectable()
export class ResendRegisterMailHandler
    implements IHandler<ResendRegisterMailCommand> {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly registerMailService: RegisterMailService,
        private readonly logger: LoggerService,
    ) {}

    async execute({
        data,
        session,
    }: ResendRegisterMailCommand): Promise<string> {
        const { userId } = data;

        // The user should exist and be not active yet
        const existingUser = await this.userRepository.findOne(userId);
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
