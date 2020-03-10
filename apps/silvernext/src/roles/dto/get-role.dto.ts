import { Type } from 'class-transformer';

import { BaseEntityResponse } from '../../_shared/dto';
import { PermissionsDto } from './permissions.dto';

export class RoleResponse extends BaseEntityResponse {
    readonly name: string;
    @Type(() => PermissionsDto)
    readonly permissions: PermissionsDto;
}
