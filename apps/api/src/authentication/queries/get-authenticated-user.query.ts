import { Injectable } from '@nestjs/common';

import { UserRepository } from '@libs/models';
import { AuthenticationUserResponse } from '../dto';
import { IHandler } from '@libs/common';

export type GetAuthenticatedUserQuery = {
    data: { userId: string };
};

@Injectable()
export class GetAuthenticatedUserHandler
    implements IHandler<GetAuthenticatedUserQuery> {
    constructor(private readonly userRepository: UserRepository) {}

    async execute({
        data,
    }: GetAuthenticatedUserQuery): Promise<AuthenticationUserResponse> {
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
            ])
            .where('user.id = :userId', { userId: data.userId })
            .getOne();
        if (!user) return null;
        return user;
    }
}
