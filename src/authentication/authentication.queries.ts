import { Injectable } from '@nestjs/common';

import { UserRepository } from '../database';
import { IUserSession } from '../_shared/constants';
import { LoggedInUserResponse } from './dto';

@Injectable()
export class AuthenticationQueries {
    constructor(private readonly userRepository: UserRepository) {}

    async getLoggedInUser(
        session: IUserSession,
    ): Promise<LoggedInUserResponse> {
        return await this.userRepository
            .createQueryBuilder('user')
            .select([
                'user.id',
                'user.createdAt',
                'user.updatedAt',
                'user.email',
                'user.state',
                'user.firstName',
                'user.lastName',
            ])
            .where('user.id = :userId', { userId: session.userId })
            .getOne();
    }
}
