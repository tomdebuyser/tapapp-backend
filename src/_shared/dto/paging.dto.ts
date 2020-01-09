import {
    IsInt,
    IsPositive,
    IsOptional,
    IsString,
    IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { SortDirection } from '../constants';

export class PagingQuery {
    @ApiProperty({ format: 'integer', required: false })
    @IsOptional()
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    readonly take?: number;

    @ApiProperty({ format: 'integer', required: false })
    @IsOptional()
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    readonly skip?: number;

    @ApiProperty({ format: 'string', required: false })
    @IsOptional()
    @IsString()
    readonly search?: string;

    @ApiProperty({ enum: SortDirection, required: false })
    @IsOptional()
    @IsEnum(SortDirection)
    readonly sortDirection?: SortDirection;
}

export class PagingMeta {
    readonly count: number;
    readonly totalCount: number;
}
