import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestPasswordResetRequest {
    @IsEmail()
    @IsNotEmpty()
    readonly email: string;
}
