import { IsString, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

import { PermissionsDto } from './permissions.dto';

export class CreateRoleRequest {
    @IsNotEmpty()
    @IsString()
    readonly name: string;

    @Type(() => PermissionsDto)
    @ValidateNested()
    readonly permissions: PermissionsDto;
}
