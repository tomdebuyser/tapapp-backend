import { IsEmail, IsOptional, ArrayNotEmpty, IsUUID } from 'class-validator';

import { IsName } from '@libs/common/validators';

export class CreateUserRequest {
    @IsEmail()
    readonly email: string;

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
