import {
    IsEmail,
    IsString,
    IsOptional,
    ArrayNotEmpty,
    IsUUID,
} from 'class-validator';

export class CreateUserRequest {
    @IsEmail()
    readonly email: string;

    @IsUUID('4', { each: true })
    @ArrayNotEmpty()
    readonly roleIds: string[];

    @IsString()
    @IsOptional()
    readonly firstName?: string;

    @IsString()
    @IsOptional()
    readonly lastName?: string;
}
