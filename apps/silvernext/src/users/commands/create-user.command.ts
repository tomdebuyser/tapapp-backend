import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';

import { UserRepository, User, RoleRepository } from '@libs/models';
import { LoggerService } from '@libs/logger';
import { CreateUserRequest } from '../dto';
import { EmailAlreadyInUse, RoleNotFound } from '../users.errors';
import { UserSession } from '../../shared/constants';
import { RegisterMailService } from '../services/register-mail.service';

const context = 'CreateUserHandler';

@Injectable()
export class CreateUserHandler {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly roleRepository: RoleRepository,
        private readonly registerMailService: RegisterMailService,
        private readonly logger: LoggerService,
    ) {}

    async execute(
        body: CreateUserRequest,
        session: UserSession,
    ): Promise<string> {
        const { email, firstName, lastName } = body;
        const roleIds = Array.from(new Set(body.roleIds));

        // The user should not exist yet
        const existingUser = await this.userRepository.findOne({
            email,
        });
        if (existingUser) {
            this.logger.warn('Failed to create: user email already in use', {
                context,
                email,
            });
            throw new EmailAlreadyInUse();
        }

        // Add the roles relationships
        const roles = await this.roleRepository.find({ id: In(roleIds) });
        if (roles.length !== roleIds.length) {
            this.logger.warn('Failed to create, roles not found', {
                context,
                roleIds,
            });
            throw new RoleNotFound();
        }

        // Create the user
        const user = User.create({
            roles,
            email,
            firstName: firstName || null,
            lastName: lastName || null,
            createdBy: session.email,
        });
        await this.userRepository.save(user);

        // Send register mail
        this.registerMailService.sendMail(user, session);

        return user.id;
    }
}
