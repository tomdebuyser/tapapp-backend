import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { PermissionsDto } from './permissions.dto';
import { IsName } from '@libs/common/validators';

export class CreateRoleRequest {
    @IsName()
    readonly name: string;

    @Type(() => PermissionsDto)
    @ValidateNested()
    readonly permissions: PermissionsDto;
}
