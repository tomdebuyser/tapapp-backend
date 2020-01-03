import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserRepository, User } from '../database';
import { CreateUserRequest } from './dto';
import { EmailAlreadyInUse } from './errors';

@Injectable()
export class UsersService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
    ) {}

    async createUser(body: CreateUserRequest): Promise<void> {
        const { email } = body;
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

        await this.userRepository.save(user);

        // TODO: Send mail to inform user
        // TODO: Add roles
    }
}
