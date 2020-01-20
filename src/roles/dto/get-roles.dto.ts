import { IsOptional, IsEnum } from 'class-validator';

import { PagingQuery, PagingMeta } from '../../_shared/dto';
import { RoleResponse } from './get-role.dto';

export enum RolesSortColumns {
    Name = 'name',
    CreatedAt = 'createdAt',
    UpdatedAt = 'updatedAt',
    CreatedBy = 'createdBy',
    UpdatedBy = 'updatedBy',
}

export class GetRolesRequestQuery extends PagingQuery {
    @IsOptional()
    @IsEnum(RolesSortColumns)
    readonly sortBy?: RolesSortColumns;
}

export class GetRolesResponse {
    readonly meta: PagingMeta;
    readonly data: RoleResponse[];
}
