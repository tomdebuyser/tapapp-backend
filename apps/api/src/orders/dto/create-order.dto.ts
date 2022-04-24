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

export class CreateOrderItemRequest {
    @IsInt()
    @IsPositive()
    @IsNotIn([0])
    @Type(() => Number)
    readonly amount: number;

    @IsUUID()
    @IsNotEmpty()
    readonly productId: string;
}

export class CreateOrderRequest {
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    readonly clientName?: string;

    @ArrayNotEmpty()
    @Type(() => CreateOrderItemRequest)
    @ValidateNested({ each: true })
    readonly items: CreateOrderItemRequest[];
}
