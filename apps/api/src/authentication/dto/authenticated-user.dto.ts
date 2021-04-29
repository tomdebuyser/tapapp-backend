import { UserState } from '@libs/models';
import { BaseEntityResponse } from '../../shared/dto';

export class AuthenticationUserResponse extends BaseEntityResponse {
    readonly email: string;
    readonly state: UserState;
    readonly firstName?: string;
    readonly lastName?: string;
}
