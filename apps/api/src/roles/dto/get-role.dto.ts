import { Type } from 'class-transformer';

import { AuditedEntityResponse } from '../../shared/dto';
import { PermissionsDto } from './permissions.dto';

export class RoleResponse extends AuditedEntityResponse {
    readonly name: string;

    @Type(() => PermissionsDto)
    readonly permissions: PermissionsDto;
}
