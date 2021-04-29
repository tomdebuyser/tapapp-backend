import { AuditedEntityResponse } from '../../shared/dto';

export class UserResponse extends AuditedEntityResponse {
    readonly email: string;
    readonly isActive: boolean;
    readonly name: string;
}
