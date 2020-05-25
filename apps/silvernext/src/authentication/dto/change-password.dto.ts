import { IsString, IsNotEmpty } from 'class-validator';

import { IsPassword } from '../../_shared/validators';

export class ChangePasswordRequest {
    @IsNotEmpty()
    @IsString()
    readonly oldPassword: string;

    @IsPassword()
    readonly newPassword: string;
}
