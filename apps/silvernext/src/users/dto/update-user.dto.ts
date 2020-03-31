import { IsUUID, IsOptional, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { IsName } from '../../_shared/validators';

export class UpdateUserRequest {
    @IsUUID('4', { each: true })
    @ArrayNotEmpty()
    readonly roleIds: string[];

    @IsOptional()
    @IsName()
    readonly firstName?: string;

    @IsOptional()
    @IsName()
    readonly lastName?: string;
}

export class UserIdParam {
    @ApiProperty({ required: true })
    @IsUUID('4')
    readonly userId: string;
}
