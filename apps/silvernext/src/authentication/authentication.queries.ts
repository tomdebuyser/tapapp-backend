import { Injectable } from '@nestjs/common';

import { UserRepository } from '@libs/database';
import { UserSession } from '../shared/constants';
import { AuthenticationUserResponse } from './dto';
import { permissionsFromRoles, createDefaultPermissions } from '../shared/util';

@Injectable()
export class AuthenticationQueries {
    constructor(private readonly userRepository: UserRepository) {}

    async composeUserSession(userId: string): Promise<UserSession> {
        const user = await this.userRepository.findOne(userId, {
            relations: ['roles'],
        });
        if (!user) return null;
        return {
            userId: user.id,
            email: user.email,
            state: user.state,
            firstName: user.firstName,
            lastName: user.lastName,
            permissions: createDefaultPermissions(
                permissionsFromRoles(user.roles),
            ),
        };
    }

    async getAuthenticatedUser(
        userId: string,
    ): Promise<AuthenticationUserResponse> {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .select([
                'user.id',
                'user.createdAt',
                'user.updatedAt',
                'user.email',
                'user.state',
                'user.firstName',
                'user.lastName',
                'role.permissions',
            ])
            .innerJoin('user.roles', 'role')
            .where('user.id = :userId', { userId })
            .getOne();
        if (!user) return null;
        const { roles, ...otherProps } = user;
        return {
            ...otherProps,
            permissions: permissionsFromRoles(roles),
        };
    }
}
