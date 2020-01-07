import { IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

import { PagingQuery, PagingMeta } from '../../_shared/dto';
import { UserState } from '../../_shared/constants';

export enum UsersSortColumns {
    Email = 'email',
    State = 'state',
    CreatedAt = 'createdAt',
    UpdatedAt = 'updatedAt',
}

export class GetUsersRequestQuery extends PagingQuery {
    @IsOptional()
    @IsEnum(UsersSortColumns)
    sortBy?: UsersSortColumns;
}

export class GetUsersResponse {
    meta: PagingMeta;
    data: GetUsersResponseData[];
}

class GetUsersResponseData {
    id: string;
    @Type(() => String)
    createdAt: Date;
    @Type(() => String)
    updatedAt: Date;
    email: string;
    state: UserState;
    firstName?: string;
    lastName?: string;
}
