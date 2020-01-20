import { IsString, ValidateNested, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { PermissionsDto } from './permissions.dto';

export class UpdateRoleRequest {
    @IsOptional()
    @IsString()
    readonly name?: string;

    @IsOptional()
    @Type(() => PermissionsDto)
    @ValidateNested()
    readonly permissions?: PermissionsDto;
}

export class RoleIdParam {
    @ApiProperty({ required: true })
    @IsUUID('4')
    readonly roleId: string;
}
