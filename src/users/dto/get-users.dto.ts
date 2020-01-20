import { IsOptional, IsEnum } from 'class-validator';

import { PagingQuery, PagingMeta } from '../../_shared/dto';
import { UserResponse } from './get-user.dto';

export enum UsersSortColumns {
    Email = 'email',
    State = 'state',
    CreatedAt = 'createdAt',
    UpdatedAt = 'updatedAt',
    CreatedBy = 'createdBy',
    UpdatedBy = 'updatedBy',
    FirstName = 'firstName',
    LastName = 'lastName',
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
