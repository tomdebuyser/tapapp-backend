import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { IsName } from '@libs/common/validators';

export class UpdateUserRequest {
    @IsNotEmpty()
    @IsName()
    readonly name?: string;
}

export class UserIdParam {
    @ApiProperty({ required: true })
    @IsUUID('4')
    readonly userId: string;
}
