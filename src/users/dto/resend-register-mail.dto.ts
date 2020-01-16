import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendRegisterMailRequestParams {
    @ApiProperty({ required: true })
    @IsUUID('4')
    readonly userId: string;
}
