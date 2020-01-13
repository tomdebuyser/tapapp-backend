import { IsOptional, IsEnum } from 'class-validator';

import { PagingQuery, PagingMeta, BaseEntityResponse } from '../../_shared/dto';
import { UserState } from '../../_shared/constants';

export enum UsersSortColumns {
    Email = 'email',
    State = 'state',
    CreatedAt = 'createdAt',
    UpdatedAt = 'updatedAt',
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
    readonly data: GetUsersResponseData[];
}

class GetUsersResponseData extends BaseEntityResponse {
    readonly email: string;
    readonly state: UserState;
    readonly roles: GetUsersResponseDataRole[];
    readonly firstName?: string;
    readonly lastName?: string;
}

class GetUsersResponseDataRole {
    readonly id: string;
    readonly name: string;
}
