import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RequestPasswordResetRequest {
    @IsEmail()
    @IsNotEmpty()
    readonly email: string;
}
