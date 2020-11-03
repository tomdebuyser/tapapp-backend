import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UserRepository } from '@libs/models';
import { LoggerService } from '@libs/logger';
import { ChangePasswordRequest } from '../dto';
import { InvalidOldPassword } from '../authentication.errors';

const context = 'ChangePasswordHandler';

@Injectable()
export class ChangePasswordHandler {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly logger: LoggerService,
    ) {}

    async execute(body: ChangePasswordRequest, userId: string): Promise<void> {
        const user = await this.userRepository.findOne(userId);

        const isCorrectOldPassword = await bcrypt.compare(
            body.oldPassword,
            user.password,
        );

        if (!isCorrectOldPassword) {
            this.logger.warn(
                'Invalid old password for change password attempt',
                {
                    context,
                    userId,
                },
            );
            throw new InvalidOldPassword();
        }

        user.password = await bcrypt.hash(body.newPassword, 10);
        await this.userRepository.save(user);
    }
}
