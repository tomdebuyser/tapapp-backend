import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';

import { UserRepository, RoleRepository } from '@libs/models';
import { LoggerService } from '@libs/logger';
import { UpdateUserRequest } from '../dto';
import { RoleNotFound, UserNotFound } from '../users.errors';
import { UserSession } from '../../shared/constants';

const context = 'UpdateUserHandler';

@Injectable()
export class UpdateUserHandler {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly roleRepository: RoleRepository,
        private readonly logger: LoggerService,
    ) {}

    async execute(
        body: UpdateUserRequest,
        userId: string,
        session: UserSession,
    ): Promise<string> {
        // The user should already exist
        const existingUser = await this.userRepository.findOne({
            id: userId,
        });
        if (!existingUser) {
            this.logger.warn('Failed to update: user with id not found', {
                context,
                userId,
            });
            throw new UserNotFound();
        }

        // Checks if each given role id matches an existing role
        const roleIds = Array.from(new Set(body.roleIds || []));
        const roles = roleIds.length
            ? await this.roleRepository.find({ id: In(roleIds) })
            : [];
        if (roles.length !== roleIds.length) {
            this.logger.warn('Failed to create, roles not found', {
                context,
                roleIds,
            });
            throw new RoleNotFound();
        }

        const { firstName, lastName } = body;
        existingUser.roles = roles;
        existingUser.firstName = firstName || null;
        existingUser.lastName = lastName || null;
        existingUser.updatedBy = session.email;

        await this.userRepository.save(existingUser);
        return existingUser.id;
    }
}
