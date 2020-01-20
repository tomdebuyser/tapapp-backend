import { BaseEntityResponse } from '../../_shared/dto';
import { UserState } from '../../_shared/constants';

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
