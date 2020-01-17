import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { In } from 'typeorm';

import { UserRepository, User, RoleRepository } from '../database';
import { CreateUserRequest } from './dto';
import {
    EmailAlreadyInUse,
    RoleNotFound,
    UserNotFound,
    AccountAlreadyActive,
} from './errors';
import { MailerService } from '../mailer/mailer.service';
import { registerMessage } from '../mailer/messages';
import { UserState, IUserSession } from '../_shared/constants';

@Injectable()
export class UsersService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
        private readonly roleRepository: RoleRepository,
        private readonly mailerService: MailerService,
    ) {}

    async createUser(
        body: CreateUserRequest,
        session: IUserSession,
        origin: string,
    ): Promise<void> {
        const { email, firstName, lastName } = body;
        const roleIds = Array.from(new Set(body.roleIds));

        // The user should not exist yet
        const existingUser = await this.userRepository.findOne({
            email,
        });
        if (existingUser) {
            throw new EmailAlreadyInUse();
        }

        // Add the roles relationships
        const user = new User();
        const roles = await this.roleRepository.find({ id: In(roleIds) });
        if (roles.length !== roleIds.length) {
            throw new RoleNotFound();
        }
        user.roles = roles;
        user.email = email;
        user.firstName = firstName || null;
        user.lastName = lastName || null;

        // Add reset token and send register mail
        await this.addResetTokenAndSendMail(user, session, origin);
    }

    async resendRegisterMail(
        userId: string,
        session: IUserSession,
        origin: string,
    ): Promise<void> {
        // The user should exist and be not active yet
        const existingUser = await this.userRepository.findOne({
            id: userId,
        });
        if (!existingUser) {
            throw new UserNotFound();
        }
        if (existingUser.state === UserState.Active) {
            throw new AccountAlreadyActive();
        }

        // Add reset token and send register mail
        await this.addResetTokenAndSendMail(existingUser, session, origin);
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
        user.createdBy = session.userId;
        user.updatedBy = session.userId;

        await this.userRepository.save(user);

        // Send mail to inform user
        this.mailerService.sendMail(registerMessage(email, resetToken, origin));
    }
}
