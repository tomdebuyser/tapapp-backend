import { Injectable } from '@nestjs/common';
import {
    GetUsersRequestQuery,
    GetUsersResponse,
    UsersSortColumns,
} from './dto';
import { UserRepository } from '../database';
import { SortDirection } from '../_shared/constants';
import { mergeDeepLeft } from 'ramda';

@Injectable()
export class UsersQueries {
    constructor(private readonly userRepository: UserRepository) {}

    async getUsers(
        requestQuery: GetUsersRequestQuery,
    ): Promise<GetUsersResponse> {
        const defaultQuery: GetUsersRequestQuery = {
            skip: 0,
            take: 20,
            sortBy: UsersSortColumns.UpdatedAt,
            sortDirection: SortDirection.Descending,
            search: '',
        };
        const query = mergeDeepLeft(requestQuery, defaultQuery);

        const [users, totalCount] = await this.userRepository
            .createQueryBuilder('user')
            .select([
                'user.id',
                'user.createdAt',
                'user.updatedAt',
                'user.email',
                'user.state',
            ])
            .orderBy(`user.${query.sortBy}`, query.sortDirection)
            .take(query.take)
            .skip(query.skip)
            .where('user.email LIKE :search', {
                search: `%${query.search}%`,
            })
            .getManyAndCount();

        return {
            meta: {
                count: users.length,
                totalCount,
            },
            data: users,
        };
    }
}
