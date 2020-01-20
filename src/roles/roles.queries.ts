import { Injectable } from '@nestjs/common';
import { mergeDeepLeft } from 'ramda';
import { SelectQueryBuilder } from 'typeorm';

import {
    GetRolesRequestQuery,
    GetRolesResponse,
    RolesSortColumns,
    RoleResponse,
} from './dto';
import { RoleRepository, Role } from '../database';
import { SortDirection } from '../_shared/constants';

@Injectable()
export class RolesQueries {
    constructor(private readonly roleRepository: RoleRepository) {}

    async getRole(roleId: string): Promise<RoleResponse> {
        return this.selectRoleColumns(
            this.roleRepository.createQueryBuilder('role'),
        )
            .where('role.id = :roleId', { roleId })
            .getOne();
    }

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

        const [roles, totalCount] = await this.selectRoleColumns(
            this.roleRepository.createQueryBuilder('role'),
        )
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

    private selectRoleColumns(
        queryBuilder: SelectQueryBuilder<Role>,
    ): SelectQueryBuilder<Role> {
        return queryBuilder.select([
            'role.id',
            'role.createdAt',
            'role.updatedAt',
            'role.createdBy',
            'role.updatedBy',
            'role.name',
            'role.permissions',
        ]);
    }
}
