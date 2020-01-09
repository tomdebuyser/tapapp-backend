import { IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

import { PagingQuery, PagingMeta, BaseEntityResponse } from '../../_shared/dto';
import { PermissionsDto } from './permissions.dto';

export enum RolesSortColumns {
    Name = 'name',
    CreatedAt = 'createdAt',
    UpdatedAt = 'updatedAt',
}

export class GetRolesRequestQuery extends PagingQuery {
    @IsOptional()
    @IsEnum(RolesSortColumns)
    readonly sortBy?: RolesSortColumns;
}

export class GetRolesResponse {
    readonly meta: PagingMeta;
    readonly data: GetRolesResponseData[];
}

class GetRolesResponseData extends BaseEntityResponse {
    readonly name: string;
    @Type(() => PermissionsDto)
    readonly permissions: PermissionsDto;
}
