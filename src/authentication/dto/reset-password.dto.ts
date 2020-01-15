import { IsJWT } from 'class-validator';
import { NewPasswordRequest } from './password.dto';

export class ResetPasswordRequest extends NewPasswordRequest {
    @IsJWT()
    readonly resetToken: string;
}
