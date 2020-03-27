import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { In } from 'typeorm';

import {
    UserRepository,
    User,
    RoleRepository,
    UserState,
} from '@libs/database';
import { MailerService } from '@libs/mailer';
import { LoggerService } from '@libs/logger';
import { CreateUserRequest, UpdateUserRequest } from './dto';
import {
    EmailAlreadyInUse,
    RoleNotFound,
    UserNotFound,
    AccountAlreadyActive,
} from './errors';
import { registerMessage } from '../_shared/messages';
import { IUserSession } from '../_shared/constants';

const context = 'UsersService';

@Injectable()
export class UsersService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
        private readonly roleRepository: RoleRepository,
        private readonly mailerService: MailerService,
        private readonly logger: LoggerService,
    ) {}

    async createUser(
        body: CreateUserRequest,
        session: IUserSession,
        origin: string,
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
        const user = new User();
        const roles = await this.roleRepository.find({ id: In(roleIds) });
        if (roles.length !== roleIds.length) {
            this.logger.warn('Failed to create, roles not found', {
                context,
                roleIds,
            });
            throw new RoleNotFound();
        }
        user.roles = roles;
        user.email = email;
        user.firstName = firstName || null;
        user.lastName = lastName || null;

        // Add reset token and send register mail
        await this.addResetTokenAndSendMail(user, session, origin);

        return user.id;
    }

    async updateUser(
        body: UpdateUserRequest,
        userId: string,
        session: IUserSession,
    ): Promise<string> {
        const { firstName, lastName } = body;
        const roleIds = Array.from(new Set(body.roleIds || []));

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

        // Update the properties if provided
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
        if (roles.length) existingUser.roles = roles;
        if ('firstName' in body) existingUser.firstName = firstName || null;
        if ('lastName' in body) existingUser.lastName = lastName || null;
        existingUser.updatedBy = session.email;

        await this.userRepository.save(existingUser);

        return existingUser.id;
    }

    async resendRegisterMail(
        userId: string,
        session: IUserSession,
        origin: string,
    ): Promise<string> {
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

        // Add reset token and send register mail
        await this.addResetTokenAndSendMail(existingUser, session, origin);

        return existingUser.id;
    }

    private async addResetTokenAndSendMail(
        user: User,
        session: IUserSession,
        origin: string,
    ): Promise<void> {
        const { email } = user;

        // Create a resetToken for the user
        const resetToken = await this.jwtService.signAsync(
            { email },
            { expiresIn: '1d' },
        );
        user.resetToken = resetToken;
        user.state = UserState.Registering;
        user.createdBy = session.email;
        user.updatedBy = session.email;

        await this.userRepository.save(user);

        // Send mail to inform user
        this.mailerService.sendMail(registerMessage(email, resetToken, origin));
    }

    async deactivateUser(
        userId: string,
        session: IUserSession,
    ): Promise<string> {
        // The user should already exist
        const existingUser = await this.userRepository.findOne(userId);
        if (!existingUser) {
            this.logger.warn('Failed to deactivate: user with id not found', {
                context,
                userId,
            });
            throw new UserNotFound();
        }

        // Set the state to inactive
        await this.userRepository.update(userId, {
            state: UserState.Inactive,
            resetToken: null,
            updatedBy: session.email,
        });

        // TODO: Remove all cookies for this user - Therefore we should store a set of cookies for each user in redis (check astrum)

        return userId;
    }
}