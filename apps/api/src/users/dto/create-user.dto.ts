import { IsEmail, IsOptional } from 'class-validator';

import { IsName } from '@libs/common/validators';

export class CreateUserRequest {
    @IsEmail()
    readonly email: string;

    @IsOptional()
    @IsName()
    readonly firstName?: string;

    @IsOptional()
    @IsName()
    readonly lastName?: string;
}
