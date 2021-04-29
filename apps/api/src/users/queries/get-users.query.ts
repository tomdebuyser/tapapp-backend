import { Injectable } from '@nestjs/common';
import { mergeDeepLeft } from 'ramda';

import { UserRepository } from '@libs/models';
import { IHandler } from '@libs/common';
import {
    GetUsersRequestQuery,
    GetUsersResponse,
    UsersSortColumns,
} from '../dto';
import { SortDirection } from '../../shared/constants';

export type GetUsersQuery = {
    data: GetUsersRequestQuery;
};

@Injectable()
export class GetUsersHandler implements IHandler<GetUsersQuery> {
    constructor(private readonly userRepository: UserRepository) {}

    async execute({ data }: GetUsersQuery): Promise<GetUsersResponse> {
        const defaultQuery: GetUsersRequestQuery = {
            skip: 0,
            take: 20,
            sortBy: UsersSortColumns.UpdatedAt,
            sortDirection: SortDirection.Descending,
            search: '',
        };
        const query = mergeDeepLeft(data, defaultQuery);

        const [users, totalCount] = await this.userRepository
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
            .orderBy(`user.${query.sortBy}`, query.sortDirection)
            .take(query.take)
            .skip(query.skip)
            .where(
                'user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search',
                {
                    search: `%${query.search}%`,
                },
            )
            .getManyAndCount();

        return {
            meta: {
                count: users.length,
                totalCount,
                skip: query.skip,
            },
            data: users,
        };
    }
}
