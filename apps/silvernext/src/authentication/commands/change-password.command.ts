import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UserRepository } from '@libs/models';
import { LoggerService } from '@libs/logger';
import { IHandler } from '@libs/common';
import { ChangePasswordRequest } from '../dto';
import { InvalidOldPassword } from '../authentication.errors';
import { UserSession } from '../../shared/constants';

const context = 'ChangePasswordHandler';

export type ChangePasswordCommand = {
    data: ChangePasswordRequest;
    session: UserSession;
};

@Injectable()
export class ChangePasswordHandler implements IHandler<ChangePasswordCommand> {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly logger: LoggerService,
    ) {}

    async execute({ data, session }: ChangePasswordCommand): Promise<void> {
        const user = await this.userRepository.findOne(session.userId);

        const isCorrectOldPassword = await bcrypt.compare(
            data.oldPassword,
            user.password,
        );

        if (!isCorrectOldPassword) {
            this.logger.warn(
                'Invalid old password for change password attempt',
                {
                    context,
                    userId: session.userId,
                },
            );
            throw new InvalidOldPassword();
        }

        user.password = await bcrypt.hash(data.newPassword, 10);
        await this.userRepository.save(user);
    }
}
