import { IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateUserRequest {
    @IsEmail()
    readonly email: string;

    @IsString()
    @IsOptional()
    readonly firstName?: string;

    @IsString()
    @IsOptional()
    readonly lastName?: string;
}
