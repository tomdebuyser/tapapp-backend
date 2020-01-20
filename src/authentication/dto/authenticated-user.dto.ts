import { BaseEntityResponse } from '../../_shared/dto';
import { UserState } from '../../_shared/constants';

export class AuthenticationUserResponse extends BaseEntityResponse {
    readonly email: string;
    readonly state: UserState;
    readonly firstName?: string;
    readonly lastName?: string;
}
