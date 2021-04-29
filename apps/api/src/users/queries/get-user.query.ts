import { Injectable } from '@nestjs/common';

import { UserRepository } from '@libs/models';
import { IHandler } from '@libs/common';
import { UserIdParam, UserResponse } from '../dto';

export type GetUserQuery = {
    data: UserIdParam;
};

@Injectable()
export class GetUserHandler implements IHandler<GetUserQuery> {
    constructor(private readonly userRepository: UserRepository) {}

    async execute({ data }: GetUserQuery): Promise<UserResponse> {
        const { userId } = data;

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
            ])
            .where('user.id = :userId', { userId })
            .getOne();
    }
}
