import { IsString, IsNotEmpty } from 'class-validator';

import { IsPassword } from '@libs/common/validators';

export class ChangePasswordRequest {
    @IsNotEmpty()
    @IsString()
    readonly oldPassword: string;

    @IsPassword()
    readonly newPassword: string;
}
