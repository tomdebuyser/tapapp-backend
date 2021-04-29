import { ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { PermissionsDto } from './permissions.dto';
import { IsName } from '@libs/common/validators';

export class UpdateRoleRequest {
    @IsName()
    readonly name: string;

    @Type(() => PermissionsDto)
    @ValidateNested()
    readonly permissions: PermissionsDto;
}

export class RoleIdParam {
    @ApiProperty({ required: true })
    @IsUUID('4')
    readonly roleId: string;
}
