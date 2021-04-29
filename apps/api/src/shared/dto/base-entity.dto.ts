import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BaseEntityResponse {
    @ApiProperty({ required: true })
    readonly id: string;

    @ApiProperty({ required: true })
    @Type(() => String)
    readonly createdAt: Date;

    @ApiProperty({ required: true })
    @Type(() => String)
    readonly updatedAt: Date;
}
