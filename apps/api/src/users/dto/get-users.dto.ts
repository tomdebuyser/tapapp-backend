import { IsOptional, IsEnum } from 'class-validator';

import { PagingQuery, PagingMeta } from '../../shared/dto';
import { UserResponse } from './get-user.dto';

export enum UsersSortColumns {
    Email = 'email',
    IsActive = 'isActive',
    CreatedAt = 'createdAt',
    UpdatedAt = 'updatedAt',
    CreatedBy = 'createdBy',
    UpdatedBy = 'updatedBy',
    Name = 'name',
}

export class GetUsersRequestQuery extends PagingQuery {
    @IsOptional()
    @IsEnum(UsersSortColumns)
    readonly sortBy?: UsersSortColumns;
}

export class GetUsersResponse {
    readonly meta: PagingMeta;
    readonly data: UserResponse[];
}
