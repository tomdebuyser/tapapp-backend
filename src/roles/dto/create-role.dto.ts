import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { PermissionsDto } from './permissions.dto';

export class CreateRoleRequest {
    @IsString()
    readonly name: string;

    @Type(() => PermissionsDto)
    @ValidateNested()
    readonly permissions: PermissionsDto;
}
