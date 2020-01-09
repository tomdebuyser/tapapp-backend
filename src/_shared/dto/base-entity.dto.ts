import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BaseEntityResponse {
    @ApiProperty({ format: 'string', required: true })
    id: string;

    @ApiProperty({ format: 'string', required: true })
    @Type(() => String)
    createdAt: Date;

    @ApiProperty({ format: 'string', required: true })
    @Type(() => String)
    updatedAt: Date;
}
