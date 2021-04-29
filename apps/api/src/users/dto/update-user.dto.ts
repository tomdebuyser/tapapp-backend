import { IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { IsName } from '@libs/common/validators';

export class UpdateUserRequest {
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
