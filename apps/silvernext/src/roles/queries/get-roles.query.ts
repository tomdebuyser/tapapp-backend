import { Injectable } from '@nestjs/common';
import { mergeDeepLeft } from 'ramda';

import { RoleRepository } from '@libs/models';
import { IHandler } from '@libs/common';
import {
    GetRolesRequestQuery,
    GetRolesResponse,
    RolesSortColumns,
} from '../dto';
import { SortDirection } from '../../shared/constants';

export type GetRolesQuery = {
    data: GetRolesRequestQuery;
};

@Injectable()
export class GetRolesHandler implements IHandler<GetRolesQuery> {
    constructor(private readonly roleRepository: RoleRepository) {}

    async execute({ data }: GetRolesQuery): Promise<GetRolesResponse> {
        const defaultQuery: GetRolesRequestQuery = {
            skip: 0,
            take: 20,
            sortBy: RolesSortColumns.Name,
            sortDirection: SortDirection.Descending,
            search: '',
        };
        const query = mergeDeepLeft(data, defaultQuery);

        const [roles, totalCount] = await this.roleRepository
            .createQueryBuilder('role')
            .select('role')
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
