import { BaseEntityResponse } from '../../shared/dto';

export class AuthenticationUserResponse extends BaseEntityResponse {
    readonly email: string;
    readonly name?: string;
}
