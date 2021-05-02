import {
    IsString,
    IsOptional,
    ValidateNested,
    IsNotEmpty,
    ArrayNotEmpty,
    IsUUID,
    IsInt,
    IsPositive,
    IsNotIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderItemRequest {
    @IsOptional()
    @IsUUID('4')
    readonly id: string;

    @IsInt()
    @IsPositive()
    @IsNotIn([0])
    @Type(() => Number)
    readonly amount: number;

    @IsUUID('4')
    @IsNotEmpty()
    readonly productId: string;
}

export class UpdateOrderRequest {
    @ApiProperty({ description: 'If not passed, it is not updated' })
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    readonly clientName?: string;

    @ArrayNotEmpty()
    @Type(() => UpdateOrderItemRequest)
    @ValidateNested({ each: true })
    readonly items: UpdateOrderItemRequest[];
}
