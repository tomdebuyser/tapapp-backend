import { Injectable } from '@nestjs/common';
import { mergeDeepLeft } from 'ramda';

import {
    GetRolesRequestQuery,
    GetRolesResponse,
    RolesSortColumns,
} from './dto';
import { RoleRepository } from '../database';
import { SortDirection } from '../_shared/constants';

@Injectable()
export class RolesQueries {
    constructor(private readonly roleRepository: RoleRepository) {}

    async getRoles(
        requestQuery: GetRolesRequestQuery,
    ): Promise<GetRolesResponse> {
        const defaultQuery: GetRolesRequestQuery = {
            skip: 0,
            take: 20,
            sortBy: RolesSortColumns.Name,
            sortDirection: SortDirection.Descending,
            search: '',
        };
        const query = mergeDeepLeft(requestQuery, defaultQuery);

        const [roles, totalCount] = await this.roleRepository
            .createQueryBuilder('role')
            .select([
                'role.id',
                'role.createdAt',
                'role.updatedAt',
                'role.name',
                'role.permissions',
            ])
            .orderBy(`role.${query.sortBy}`, query.sortDirection)
            .take(query.take)
            .skip(query.skip)
            .where('role.name ILIKE :search', {
                search: `%${query.search}%`,
            })
            .getManyAndCount();

        return {
            meta: {
                count: roles.length,
                totalCount,
                skip: query.skip,
            },
            data: roles,
        };
    }
}
