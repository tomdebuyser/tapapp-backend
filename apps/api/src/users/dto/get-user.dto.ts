import { UserState } from '@libs/models';
import { AuditedEntityResponse } from '../../shared/dto';

export class UserResponse extends AuditedEntityResponse {
    readonly email: string;
    readonly state: UserState;
    readonly firstName?: string;
    readonly lastName?: string;
}
