import { Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NewPasswordRequest {
    @ApiProperty({ required: true })
    @Matches(new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$'), {
        message:
            'Password requirements: min. 8 characters, at least one uppercase letter, one lowercase letter, and one number.',
    })
    readonly newPassword: string;
}
