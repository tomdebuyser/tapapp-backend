import { IsJWT } from 'class-validator';

import { IsPassword } from '@libs/common/validators';

export class ResetPasswordRequest {
    @IsJWT()
    readonly resetToken: string;

    @IsPassword()
    readonly newPassword: string;
}
