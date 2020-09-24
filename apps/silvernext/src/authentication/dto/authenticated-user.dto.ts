import { UserState } from '@libs/database';
import { BaseEntityResponse } from '../../shared/dto';
import { PermissionsDto } from '../../roles/dto';

export class AuthenticationUserResponse extends BaseEntityResponse {
    readonly email: string;
    readonly state: UserState;
    readonly firstName?: string;
    readonly lastName?: string;
    readonly permissions: PermissionsDto;
}
