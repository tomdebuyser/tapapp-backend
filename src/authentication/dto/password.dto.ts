import { Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NewPasswordRequest {
    @ApiProperty({ format: 'string', required: true })
    @Matches(
        new RegExp(
            '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$',
        ),
        {
            message:
                'Password requirements: min. 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character.',
        },
    )
    readonly newPassword: string;
}
