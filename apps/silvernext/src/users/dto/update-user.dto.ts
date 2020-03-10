import { IsUUID, IsString, IsOptional, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRequest {
    @IsUUID('4', { each: true })
    @IsOptional()
    @ArrayNotEmpty()
    readonly roleIds?: string[];

    @IsString()
    @IsOptional()
    readonly firstName?: string;

    @IsString()
    @IsOptional()
    readonly lastName?: string;
}

export class UserIdParam {
    @ApiProperty({ required: true })
    @IsUUID('4')
    readonly userId: string;
}
