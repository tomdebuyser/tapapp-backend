import { IsEmail } from 'class-validator';

export class CreateUserRequest {
    @IsEmail()
    readonly email: string;
}
