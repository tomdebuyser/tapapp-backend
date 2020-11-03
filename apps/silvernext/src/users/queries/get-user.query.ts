import { Injectable } from '@nestjs/common';

import { UserRepository } from '@libs/models';
import { UserResponse } from '../dto';

@Injectable()
export class GetUserHandler {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(userId: string): Promise<UserResponse> {
        return this.userRepository
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
                'role.id',
                'role.name',
            ])
            .innerJoin('user.roles', 'role')
            .where('user.id = :userId', { userId })
            .getOne();
    }
}
