import { IsEmail, IsNotEmpty } from 'class-validator';

import { IsName } from '@libs/common/validators';

export class CreateUserRequest {
    @IsEmail()
    readonly email: string;

    @IsNotEmpty()
    @IsName()
    readonly name: string;
}
