import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { In } from 'typeorm';

import { UserRepository, User, RoleRepository } from '../database';
import { CreateUserRequest } from './dto';
import { EmailAlreadyInUse, RoleNotFound } from './errors';

@Injectable()
export class UsersService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
        private readonly roleRepository: RoleRepository,
    ) {}

    async createUser(body: CreateUserRequest): Promise<void> {
        const { email, firstName, lastName } = body;
        const roleIds = Array.from(new Set(body.roleIds));
        const existingUser = await this.userRepository.findOne({
            email,
        });
        if (existingUser) {
            throw new EmailAlreadyInUse();
        }

        const resetToken = this.jwtService.sign({ email }, { expiresIn: '1d' });
        const user = new User();
        user.email = email;
        user.resetToken = resetToken;
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;

        // Add the roles relationships
        const roles = await this.roleRepository.find({ id: In(roleIds) });
        if (roles.length !== roleIds.length) {
            throw new RoleNotFound();
        }
        user.roles = roles;

        await this.userRepository.save(user);

        // TODO: Send mail to inform user
    }
}
