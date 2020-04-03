import { IsJWT } from 'class-validator';

import { IsPassword } from '../../_shared/validators';

export class ResetPasswordRequest {
    @IsJWT()
    readonly resetToken: string;

    @IsPassword()
    readonly newPassword: string;
}
