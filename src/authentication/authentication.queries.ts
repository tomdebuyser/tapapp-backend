import { Injectable } from '@nestjs/common';

import { UserRepository } from '../database';
import { IUserSession } from '../_shared/constants';
import { LoggedInUserResponse } from './dto';

@Injectable()
export class AuthenticationQueries {
    constructor(private readonly userRepository: UserRepository) {}

    async composeUserSession(userId: string): Promise<IUserSession> {
        const user = await this.userRepository.findOne({ id: userId });
        if (!user) return null;
        return {
            userId: user.id,
            email: user.email,
            state: user.state,
            firstName: user.firstName,
            lastName: user.lastName,
            roles: user.roles,
        };
    }

    async getLoggedInUser(userId: string): Promise<LoggedInUserResponse> {
        // TODO: Extend this representation with roles later
        return await this.userRepository
            .createQueryBuilder('user')
            .select([
                'user.id',
                'user.createdAt',
                'user.updatedAt',
                'user.createdBy',
                'user.updatedBy',
                'user.email',
                'user.state',
                'user.firstName',
                'user.lastName',
            ])
            .where('user.id = :userId', { userId })
            .getOne();
    }
}
