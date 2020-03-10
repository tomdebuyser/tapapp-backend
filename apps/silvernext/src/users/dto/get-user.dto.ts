import { UserState } from '@libs/database';
import { BaseEntityResponse } from '../../_shared/dto';

export class UserResponse extends BaseEntityResponse {
    readonly email: string;
    readonly state: UserState;
    readonly roles: UserResponseRole[];
    readonly firstName?: string;
    readonly lastName?: string;
}

class UserResponseRole {
    readonly id: string;
    readonly name: string;
}
